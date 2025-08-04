// import { motion } from "framer-motion";
import { useState } from "react";

interface AnimatedNavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = ["Dashboard", "Patient", "Appointment", "Report"];

const AnimatedNavigationTabs: React.FC<AnimatedNavigationTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const [selected, setSelected] = useState(activeTab);

  const handleTabChange = (tab: string) => {
    setSelected(tab);
    onTabChange(tab);
  };

  const containerStyles = {
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginLeft: '32px'
  };

  return (
    <div style={containerStyles}>
      {tabs.map((tab) => (
        <Chip
          text={tab}
          selected={selected === tab}
          setSelected={handleTabChange}
          key={tab}
        />
      ))}
    </div>
  );
};

const Chip = ({
  text,
  selected,
  setSelected,
}: {
  text: string;
  selected: boolean;
  setSelected: (text: string) => void;
}) => {
  const buttonStyles = {
    background: selected ? '#2563eb' : '#3b82f6', // blue-600 : blue-500
    color: 'white',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
    boxShadow: selected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
    ...(selected ? {} : {
      ':hover': {
        background: '#2563eb' // blue-600 on hover
      }
    })
  };

  return (
    <button
      onClick={() => setSelected(text)}
      style={buttonStyles}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = '#2563eb';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = '#3b82f6';
        }
      }}
    >
      {text}
    </button>
  );
};

export default AnimatedNavigationTabs; 