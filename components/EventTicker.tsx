import React from 'react';

interface CalendarEvent {
  computedDate: Date;
  title: string;
  level: 'GLOBAL' | 'NATIONAL' | 'DIOCESE' | 'DISTRICT' | 'PARISH';
}

interface EventTickerProps {
  events: CalendarEvent[];
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Define a stable sub-component for the item itself for better performance and predictability.
const TickerItem: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  return (
    <div className="ticker-item">
      <span className="date">{formatDate(event.computedDate)}:</span>
      <span className="title"> {event.title}</span>
      <span className="level">({event.level})</span>
    </div>
  );
};

const TickerSeparator: React.FC = () => (
    <span className="ticker-item text-vatican-gold font-extrabold px-6" aria-hidden="true">
        &#x271D;
    </span>
);


const EventTicker: React.FC<EventTickerProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return null;
  }

  // Helper to generate a guaranteed unique key for each item.
  const createKey = (prefix: string, event: CalendarEvent, index: number) => {
    return `${prefix}-${event.title}-${event.computedDate.getTime()}-${index}`;
  };

  return (
    <div className="ticker-wrap">
      <div className="ticker-move" style={{ animationDuration: `${events.length * 1}s` }}>
        {/* Render the first set of events */}
        {events.map((event, index) => (
          <TickerItem key={createKey('run1', event, index)} event={event} />
        ))}
        {/* Add a separator to make the loop point visually distinct */}
        <TickerSeparator />
        {/* Render the second set of events for seamless looping */}
        {events.map((event, index) => (
          <TickerItem key={createKey('run2', event, index)} event={event} />
        ))}
        {/* Add a final separator to complete the duplicated block */}
        <TickerSeparator />
      </div>
    </div>
  );
};

export default EventTicker;
