import { User, Territory, ROLES, Believer } from '../types';

interface PermissionOptions {
  target?: Territory | null;
  parent?: Territory | null;
  grandparent?: Territory | null;
  believer?: Believer | null;
}

/**
 * Checks if a user has permission to perform an action based on a strict hierarchical model with delegation.
 * @param user The user performing the action.
 * @param action The action being performed (e.g., 'CREATE_ZONE').
 * @param options An object containing the target entities for the action.
 * @returns {boolean} True if the user has permission, false otherwise.
 */
export const hasPermission = (user: User | null, action: string, options: PermissionOptions = {}): boolean => {
  if (!user) {
    return false;
  }

  // Global Admin has all permissions
  if (user.role === ROLES.admin) {
    return true;
  }
  
  const { target, parent, believer } = options;

  // Believer can edit their own information.
  if (action === 'EDIT_BELIEVER_SELF') {
    if (!believer) return false;
    return user.believerId === believer.id;
  }
  
  // For most other actions, a target territory is required.
  if (!target) {
    return false; 
  }

  const isDirectLeader = user.highestLevelTerritoryId === target.id;
  const isActingLeader = user.actingPermissions?.includes(target.id) ?? false;
  
  switch (action) {
    // --- Priest-specific actions ---
    case 'EDIT_PRIEST_MESSAGE':
      if (target.type !== 'PARISH') return false;
      // Only a priest whose highest territory is THIS parish can edit the message.
      return user.role === ROLES.priest && user.highestLevelTerritoryId === target.id;

    // --- Territory Creation ---
    case 'CREATE_ZONE':
      // A Parish Leader can create a Zone in their own Parish. Target is the Parish.
      return target.type === 'PARISH' && user.role === ROLES.parish_leader && isDirectLeader;

    case 'CREATE_APV':
      // A Zone Leader can create an APV in their own Zone or a zone they have acting authority over. Target is the Zone.
      return target.type === 'ZONE' && user.role === ROLES.zone_leader && (isDirectLeader || isActingLeader);

    // --- Territory Modification/Deletion ---
    case 'EDIT_PARISH_DETAILS':
        if (target.type !== 'PARISH') return false;
        // The direct Parish Leader can edit parish details. The Priest is now excluded from this broad permission.
        return (user.role === ROLES.parish_leader && isDirectLeader);

    case 'EDIT_TERRITORY':
    case 'DELETE_TERRITORY':
      if (!target || !parent) return false;
      
      // Parish Leader can edit/delete a Zone within their parish.
      if (target.type === 'ZONE' && parent.type === 'PARISH' && user.role === ROLES.parish_leader && user.highestLevelTerritoryId === parent.id) {
        return true;
      }
      // Zone Leader can edit/delete an APV within their zone.
      if (target.type === 'APV' && parent.type === 'ZONE' && user.role === ROLES.zone_leader && user.highestLevelTerritoryId === parent.id) {
        return true;
      }
      return false;

    // --- Household/Family Management ---
    case 'ADD_FAMILY': // Target is APV
      // An APV Leader can add a family in their own APV.
      if (target.type === 'APV' && user.role === ROLES.apv_leader && isDirectLeader) {
        return true;
      }
      // A Zone Leader can add a family in an APV they have acting authority over.
      if (target.type === 'APV' && user.role === ROLES.zone_leader && isActingLeader) {
        return true;
      }
      return false;

    case 'EDIT_FAMILY': // Target is Family, parent is APV
      if (target.type !== 'FAMILY' || !parent || parent.type !== 'APV') return false;

      const isDirectLeaderOfParentAPV = user.highestLevelTerritoryId === parent.id;
      const isActingLeaderOfParentAPV = user.actingPermissions?.includes(parent.id) ?? false;
      
      // Head of Family can edit their own family.
      if (user.role === ROLES.headOfFamily && user.highestLevelTerritoryId === target.id) {
          return true;
      }
      // An APV Leader can modify families in their APV.
      if (user.role === ROLES.apv_leader && isDirectLeaderOfParentAPV) {
          return true;
      }
      // A Zone Leader can modify families in an APV they have acting authority over.
      if (user.role === ROLES.zone_leader && isActingLeaderOfParentAPV) {
          return true;
      }
      return false;

    case 'DELETE_FAMILY':
        if (target.type !== 'FAMILY' || !parent || parent.type !== 'APV') return false;
        // APV leader can delete a family in their APV
        if(user.role === ROLES.apv_leader && user.highestLevelTerritoryId === parent.id) {
            return true;
        }
        // Head of Family can delete their own family
        if(user.role === ROLES.headOfFamily && user.highestLevelTerritoryId === target.id) {
            return true;
        }
        return false;
      
    // --- Believer Management ---
    case 'MANAGE_BELIEVERS_IN_FAMILY':
        // Believer management permissions are derived from family management permissions.
        return hasPermission(user, 'EDIT_FAMILY', options);

    // --- Contribution Management ---
    case 'MANAGE_CONTRIBUTIONS':
        // Reuse family editing permission logic for contribution management
        return hasPermission(user, 'EDIT_FAMILY', options);


    // --- Viewing Permissions ---
    case 'viewFamilies': // Target is the APV node
      if (!user) return false;
      // Admins, Priests, and Parish Leaders can see everything.
      if ([ROLES.admin, ROLES.priest, ROLES.parish_leader].includes(user.role)) {
        return true;
      }

      if (target?.type !== 'APV') return false;
      
      // Zone Leader can view families in any APV within their zone.
      if (user.role === ROLES.zone_leader) {
        // Check if the APV's parent is the Zone this user leads.
        if (target.parentId === user.highestLevelTerritoryId) {
            return true;
        }
        // Also check for delegated/acting permissions on the APV.
        if (user.actingPermissions?.includes(target.id)) {
            return true;
        }
      }
      
      // APV Leader can only view families in their own APV.
      if (user.role === ROLES.apv_leader && user.highestLevelTerritoryId === target.id) {
        return true;
      }
      
      // Other roles (believers, etc.) cannot expand APVs they don't lead.
      return false;

    default:
      return false;
  }
};