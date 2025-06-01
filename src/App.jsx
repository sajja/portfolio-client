import React, { useState, useEffect } from 'react';
import './SlidingPane.css'; // Import CSS for styling
import EditableTable from './components/EditableTable';

const SlidingPane = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mainContent, setMainContent] = useState('Main area');

  const handleTogglePane = () => setIsOpen((open) => !open);

  const handlePortfolioClick = (e) => {
    e.preventDefault();
    setMainContent(<EditableTable />);
  };

  return (
    <div className="container" >
      <button className="toggle-btn" onClick={handleTogglePane}>
        {isOpen ? '<' : '>'}
      </button>
      <div className={`sliding-pane${isOpen ? ' open' : ''}`}>
        <div className="pane-content">
          <h3>Me</h3>
          <div>
            <a id="pf" href="" onClick={handlePortfolioClick}>Portfolio/</a>
          </div>
          <div>
            <a id="ci" href="" >Company info/</a>
          </div>
          <div>
            <a id="ann" href="">Company announcements/</a>
          </div>
          <div>C</div>
          <div>D</div>
          <div>E</div>
          <div>F</div>
          <div>G</div>
        </div>
      </div>
      <div id="xxx" className="main-area"  style={{flexGrow: 1}}>
        {mainContent}
      </div>
    </div>
  );
};

export default SlidingPane;