import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot, FaBrain, FaMagic, FaRocket, FaCode, FaAward, FaGithub, FaClock, FaLightbulb } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleCardClick = (agent) => {
    if (!agent.comingSoon) {
      navigate('/login');
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    const headerOffset = 80; // Account for fixed header
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const heroContent = {
    tagline: "Where Innovation Meets Intelligence",
    mainQuote: "Empowering Your Future with Intelligent Automation",
    description: "Experience the next generation of AI assistance with RAxoner's intelligent agents. From resume creation to workflow automation, we're here to transform how you interact with AI.",
    stats: [
      { icon: <FaCode />, value: "100%", label: "AI-Powered" },
      { icon: <FaAward />, value: "24/7", label: "Support" },
      { icon: <FaRocket />, value: "∞", label: "Potential" }
    ]
  };

  const agents = [
    {
      id: 1,
      title: "Resume Generator",
      description: "Create professional resumes tailored to your experience and industry",
      features: [
        { icon: <FaBrain />, text: "AI-Powered Content Optimization" },
        { icon: <FaMagic />, text: "Automatic Formatting" },
        { icon: <FaRocket />, text: "Industry-Specific Templates" }
      ],
      comingSoon: false
    },
    {
      id: 2,
      title: "Smart Assistant",
      description: "Your personal AI assistant for daily tasks and productivity",
      features: [
        { icon: <FaRobot />, text: "Intelligent Task Management" },
        { icon: <FaClock />, text: "Schedule Optimization" },
        { icon: <FaLightbulb />, text: "Smart Suggestions" }
      ],
      comingSoon: true
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <motion.div 
            className="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaRobot className="logo-icon" />
            <span>RAxoner</span>
          </motion.div>
          <div className="header-links">
            <motion.button 
              onClick={() => scrollToSection('agents')} 
              className="nav-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Agents
            </motion.button>
            <motion.button 
              onClick={() => scrollToSection('features')} 
              className="nav-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Features
            </motion.button>
            <motion.a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <FaGithub />
              <span>GitHub</span>
            </motion.a>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: '80px' }}>
        <motion.section 
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="tagline">{heroContent.tagline}</span>
          <h1>{heroContent.mainQuote}</h1>
          <p className="hero-subtitle">{heroContent.description}</p>

          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {heroContent.stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="stat-item"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section 
          id="agents"
          className="cards-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2>Available Agents</h2>
          <div className="agents-grid">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                className={`card ${agent.comingSoon ? 'coming-soon' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                onClick={() => handleCardClick(agent)}
              >
                <div className="card-inner">
                  <h2>{agent.title}</h2>
                  <p className="description">{agent.description}</p>
                  <div className="features-list">
                    {agent.features.map((feature, i) => (
                      <div key={i} className="feature-item">
                        {feature.icon}
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  {!agent.comingSoon && (
                    <button className="get-started-btn">Get Started</button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          id="features"
          className="features-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-box">
              <FaBrain className="feature-icon" />
              <h3>Smart AI Processing</h3>
              <p>Advanced algorithms for intelligent content analysis and optimization</p>
            </div>
            <div className="feature-box">
              <FaRobot className="feature-icon" />
              <h3>Automated Workflows</h3>
              <p>Streamline your tasks with intelligent automation and processing</p>
            </div>
            <div className="feature-box">
              <FaMagic className="feature-icon" />
              <h3>One-Click Excellence</h3>
              <p>Transform your work instantly with our powerful AI tools</p>
            </div>
            <div className="feature-box">
              <FaRocket className="feature-icon" />
              <h3>Future-Ready</h3>
              <p>Stay ahead with cutting-edge AI technology and continuous updates</p>
            </div>
          </div>
        </motion.section>

        <motion.footer 
          className="home-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="footer-content">
            <div className="footer-info">
              <p className="copyright">© 2024 RAxoner. All rights reserved.</p>
              <p className="tagline">Empowering Your Future with AI</p>
            </div>
            <p className="footer-quote">"The future belongs to those who believe in the beauty of their dreams."</p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default HomePage;
