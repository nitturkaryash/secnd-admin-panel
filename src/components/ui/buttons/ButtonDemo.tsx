import React from 'react';
import AnimatedNeumorphicButton from './AnimatedNeumorphicButton';
import { FiSend, FiHeart, FiStar, FiUser } from 'react-icons/fi';

const ButtonDemo: React.FC = () => {
  // const [activeTab, setActiveTab] = useState('dashboard');

  // const handleTabChange = (tab: string) => {
  //   setActiveTab(tab);
  //   console.log('Tab changed to:', tab);
  // };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header with Animated Navigation */}
        <header className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">YouCare</h1>
            <div className="flex items-center space-x-8">
              <button className="text-slate-600 hover:text-slate-800 transition-colors">
                Dashboard
              </button>
              <button className="text-slate-600 hover:text-slate-800 transition-colors">
                Patient
              </button>
              <button className="text-slate-600 hover:text-slate-800 transition-colors">
                Appointment
              </button>
              <button className="text-slate-600 hover:text-slate-800 transition-colors">
                Report
              </button>
            </div>
          </div>
        </header>

        {/* Button Showcase */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Animated Neumorphic Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Basic Button */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-sm font-medium text-slate-600">Basic Button</h3>
              <AnimatedNeumorphicButton>
                Send Message
              </AnimatedNeumorphicButton>
            </div>

            {/* Button with Custom Icon */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-sm font-medium text-slate-600">With Heart Icon</h3>
              <AnimatedNeumorphicButton icon={<FiHeart />}>
                Like Post
              </AnimatedNeumorphicButton>
            </div>

            {/* Button with Star Icon */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-sm font-medium text-slate-600">With Star Icon</h3>
              <AnimatedNeumorphicButton icon={<FiStar />}>
                Rate App
              </AnimatedNeumorphicButton>
            </div>

            {/* Button with User Icon */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-sm font-medium text-slate-600">With User Icon</h3>
              <AnimatedNeumorphicButton icon={<FiUser />}>
                View Profile
              </AnimatedNeumorphicButton>
            </div>

            {/* Disabled Button */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-sm font-medium text-slate-600">Disabled State</h3>
              <AnimatedNeumorphicButton disabled>
                Disabled
              </AnimatedNeumorphicButton>
            </div>

            {/* Custom Styled Button */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-sm font-medium text-slate-600">Custom Style</h3>
              <AnimatedNeumorphicButton 
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                icon={<FiSend />}
              >
                Premium
              </AnimatedNeumorphicButton>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-slate-800 mb-2">Animated Navigation</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Smooth pill animation between tabs</li>
                <li>• Spring-based transitions</li>
                <li>• Responsive design</li>
                <li>• Hover effects on inactive tabs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-slate-800 mb-2">Enhanced Buttons</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Neumorphic design with shadows</li>
                <li>• Smooth hover and tap animations</li>
                <li>• Icon color transitions</li>
                <li>• Focus and disabled states</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonDemo; 