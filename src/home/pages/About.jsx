import React, { useState, useMemo } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Star,
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Lightbulb,
  Recycle,
  Leaf,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Calendar,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { HomeNavbar, HomeFooter } from '../components';
import '../css/About.css';

// Constants - Easy to maintain and edit
const COMPANY_OVERVIEW = {
  title: "Building a Sustainable Future",
  subtitle: "SariCycle transforms recycling from a chore into a rewarding experience that benefits both people and the planet",
  tagline: "Made with love for our environment"
};

const MISSION_VISION = [
  {
    id: 'mission',
    title: 'Our Mission',
    content: 'To make recycling accessible, rewarding, and impactful for communities across the Philippines. We believe that when people are rewarded for positive environmental actions, they\'ll continue making those choices.',
    icon: Target
  },
  {
    id: 'vision',
    title: 'Our Vision',
    content: 'A world where recycling is as natural and rewarding as any daily habit. We envision communities where environmental stewardship is celebrated and sustainably incentivized.',
    icon: Globe
  }
];

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Marco Pineda',
    role: 'CEO & Founder',
    image: 'https://i.kym-cdn.com/entries/icons/facebook/000/042/184/handsomestaringeagle.jpg',
    bio: 'Aight Foo',
    expertise: ['Thesis Leader'],
    achievements: ['PhD in Environmental Engineering', 'Green Tech Innovation Award 2023', '50 Under 50 Environmental Leaders'],
    contact: {
      email: 'marco@saricycle.com',
      linkedin: 'https://linkedin.com/in/marco'
    }
  },
  {
    id: 2,
    name: 'Kurt David Cuyugan',
    role: 'Developer',
    image: 'https://i.kym-cdn.com/entries/icons/facebook/000/042/184/handsomestaringeagle.jpg',
    bio: 'All my niggas hate ESP32',
    expertise: ['Full-Stack Development', 'IoT Systems'],
    achievements: ['MS Computer Science', 'Tech Innovation Award 2022', 'Published Author on Green Tech'],
    contact: {
      email: 'kurt@saricycle.com',
      linkedin: 'https://linkedin.com/in/kurt'
    }
  },
  {
    id: 3,
    name: 'Bien Buncio',
    role: 'Carpenter',
    image: 'https://i.kym-cdn.com/entries/icons/facebook/000/042/184/handsomestaringeagle.jpg',
    bio: 'Mamaw mag drawing',
    expertise: ['3D Modeling'],
    achievements: ['PhD Environmental Science', 'UN Sustainability Fellow', 'Climate Action Award 2023'],
    contact: {
      email: 'bien@saricycle.com',
      linkedin: 'https://linkedin.com/in/bien'
    }
  }
];

const COMPANY_VALUES = [
  {
    id: 'environmental_impact',
    title: 'Environmental Impact',
    description: 'Every decision we make is guided by its environmental impact. We\'re committed to creating solutions that genuinely help our planet.',
    icon: Globe,
    color: 'primary'
  },
  {
    id: 'community_first',
    title: 'Community First',
    description: 'We believe in empowering communities to take environmental action. Our platform is designed to bring people together for a common cause.',
    icon: Users,
    color: 'secondary'
  },
  {
    id: 'innovation',
    title: 'Innovation',
    description: 'We constantly innovate to make recycling more accessible, rewarding, and effective. Technology should serve environmental progress.',
    icon: Lightbulb,
    color: 'accent'
  },
  {
    id: 'transparency',
    title: 'Transparency',
    description: 'We operate with complete transparency about our impact, processes, and goals. Trust is built through openness and accountability.',
    icon: Shield,
    color: 'primary'
  }
];

const MILESTONES = [
  {
    id: 'founded',
    year: '2023',
    title: 'SariCycle Founded',
    description: 'Launched with a mission to make recycling rewarding and accessible for everyone.',
    icon: Zap
  },
  {
    id: 'first_partnership',
    year: '2023',
    title: 'First Community Partnership',
    description: 'Partnered with local barangays to implement our recycling reward system.',
    icon: Users
  },
  {
    id: 'app_launch',
    year: '2024',
    title: 'Mobile App Launch',
    description: 'Released our comprehensive mobile platform with digital wallet and learning modules.',
    icon: Phone
  },
  {
    id: 'expanding_impact',
    year: '2024',
    title: 'Expanding Impact',
    description: 'Growing our network of partners and users to create larger environmental impact.',
    icon: TrendingUp
  }
];

const IMPACT_STATS = [
  {
    id: 'users',
    title: 'Users Empowered',
    value: '10,000+',
    subtitle: 'Active recyclers in our community',
    icon: Users,
    color: 'primary'
  },
  {
    id: 'waste',
    title: 'Waste Diverted',
    value: '50 tons',
    subtitle: 'Plastic waste properly recycled',
    icon: Recycle,
    color: 'secondary'
  },
  {
    id: 'trees',
    title: 'Trees Saved',
    value: '1,200',
    subtitle: 'Through paper recycling efforts',
    icon: Leaf,
    color: 'accent'
  },
  {
    id: 'barangays',
    title: 'Barangays Served',
    value: '25',
    subtitle: 'Communities actively participating',
    icon: MapPin,
    color: 'primary'
  }
];

const CONTACT_INFO = [
  {
    id: 'email',
    title: 'Email Us',
    content: 'ceo@saricycle.com',
    subtitle: 'We\'d love to hear from you!',
    icon: Mail
  },
  {
    id: 'phone',
    title: 'Call Us',
    content: '+63 999 999 9999',
    subtitle: 'Mon-Fri, 9AM-6PM PH',
    icon: Phone
  },
  {
    id: 'location',
    title: 'Visit Us',
    content: 'Mabalacat City, Philippines',
    subtitle: 'Schedule a meeting with our team',
    icon: MapPin
  }
];

const About = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTeamMember, setActiveTeamMember] = useState(null);

  // Memoized handlers
  const handlers = useMemo(() => ({
    openTeamModal: (member) => setActiveTeamMember(member),
    closeTeamModal: () => setActiveTeamMember(null)
  }), []);

  // Sub-components for better organization
  const CompanyOverviewSection = () => (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2 className="welcome-title">
          {COMPANY_OVERVIEW.title.split(' ').map((word, index) => 
            word === 'Sustainable' ? (
              <span key={index} className="highlight">{word}</span>
            ) : (
              <span key={index}>{word} </span>
            )
          )}
        </h2>
        <p className="welcome-subtitle">
          {COMPANY_OVERVIEW.subtitle}
        </p>
        <div className="location-info">
          <Heart className="location-icon" />
          <span>{COMPANY_OVERVIEW.tagline}</span>
        </div>
      </div>
      <div className="welcome-image">
        <div className="recycling-illustration">
          <Recycle className="illustration-icon" />
        </div>
      </div>
    </section>
  );

  const MissionVisionSection = () => (
    <section className="stats-section">
      <h3 className="section-title">Our Mission & Vision</h3>
      <div className="mission-grid">
        {MISSION_VISION.map((item) => (
          <MissionCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );

  const MissionCard = ({ item }) => (
    <div className="mission-card">
      <div className="mission-icon">
        <item.icon className="icon" />
      </div>
      <div className="mission-content">
        <h4>{item.title}</h4>
        <p>{item.content}</p>
      </div>
    </div>
  );

  const ImpactStatsSection = () => (
    <section className="stats-section">
      <h3 className="section-title">Our Environmental Impact</h3>
      <div className="stats-grid">
        {IMPACT_STATS.map((stat) => (
          <ImpactStatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );

  const ImpactStatCard = ({ stat }) => (
    <div className={`stat-card stat-${stat.color}`}>
      <div className="stat-icon-container">
        <stat.icon className="stat-icon" />
      </div>
      <div className="stat-content">
        <h4 className="stat-value">{stat.value}</h4>
        <p className="stat-title">{stat.subtitle}</p>
      </div>
    </div>
  );

  const CompanyValuesSection = () => (
    <section className="actions-section">
      <h3 className="section-title">Our Core Values</h3>
      <div className="values-grid">
        {COMPANY_VALUES.map((value) => (
          <ValueCard key={value.id} value={value} />
        ))}
      </div>
    </section>
  );

  const ValueCard = ({ value }) => (
    <div className="value-card">
      <div className={`value-icon ${value.color}`}>
        <value.icon className="icon" />
      </div>
      <div className="value-content">
        <h4 className="value-title">{value.title}</h4>
        <p className="value-description">{value.description}</p>
      </div>
    </div>
  );

  const TeamSection = () => (
    <section className="activity-section">
      <h3 className="section-title">Meet Our Team</h3>
      <div className="team-grid">
        {TEAM_MEMBERS.map((member) => (
          <TeamCard key={member.id} member={member} onLearnMore={handlers.openTeamModal} />
        ))}
      </div>
    </section>
  );

  const TeamCard = ({ member, onLearnMore }) => (
    <div className="team-card">
      <div className="team-image">
        <img src={member.image} alt={member.name} />
        <div className="team-overlay">
          <button 
            className="learn-more-btn"
            onClick={() => onLearnMore(member)}
          >
            Learn More
          </button>
        </div>
      </div>
      <div className="team-info">
        <h4 className="team-name">{member.name}</h4>
        <p className="team-role">{member.role}</p>
        <p className="team-bio">{member.bio}</p>
        <div className="team-expertise">
          {member.expertise.slice(0, 2).map((skill, index) => (
            <span key={index} className="expertise-tag">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );

  {/*
  const TimelineSection = () => (
    <section className="activity-section">
      <h3 className="section-title">Our Journey</h3>
      <div className="timeline">
        {MILESTONES.map((milestone) => (
          <TimelineItem key={milestone.id} milestone={milestone} />
        ))}
      </div>
    </section>
  );
  */}

  const TimelineItem = ({ milestone }) => (
    <div className="timeline-item">
      <div className="timeline-icon">
        <milestone.icon className="icon" />
      </div>
      <div className="timeline-content">
        <div className="timeline-year">{milestone.year}</div>
        <h4 className="timeline-title">{milestone.title}</h4>
        <p className="timeline-description">{milestone.description}</p>
      </div>
    </div>
  );

  const ContactSection = () => (
    <section className="stats-section">
      <h3 className="section-title">Get In Touch</h3>
      <div className="contact-grid">
        {CONTACT_INFO.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </section>
  );

  const ContactCard = ({ contact }) => (
    <div className="contact-card">
      <div className="contact-icon">
        <contact.icon className="icon" />
      </div>
      <div className="contact-content">
        <h4>{contact.title}</h4>
        <p>{contact.content}</p>
        <small>{contact.subtitle}</small>
      </div>
    </div>
  );

  const TeamMemberModal = () => {
    if (!activeTeamMember) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>{activeTeamMember.name}</h3>
            <button 
              className="modal-close"
              onClick={handlers.closeTeamModal}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          <div className="modal-body">
            <div className="team-details">
              <div className="team-profile">
                <img src={activeTeamMember.image} alt={activeTeamMember.name} className="profile-image" />
                <div className="profile-info">
                  <h4>{activeTeamMember.name}</h4>
                  <p className="profile-role">{activeTeamMember.role}</p>
                </div>
              </div>
              
              <div className="team-section">
                <h4>About</h4>
                <p>{activeTeamMember.bio}</p>
              </div>
              
              <div className="team-section">
                <h4>Expertise</h4>
                <div className="expertise-list">
                  {activeTeamMember.expertise.map((skill, index) => (
                    <span key={index} className="expertise-badge">{skill}</span>
                  ))}
                </div>
              </div>
              
              <div className="team-section">
                <h4>Achievements</h4>
                <ul className="achievements-list">
                  {activeTeamMember.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
              
              <div className="team-section">
                <h4>Contact</h4>
                <div className="contact-links">
                  <a href={`mailto:${activeTeamMember.contact.email}`} className="contact-link">
                    <Mail className="contact-icon" />
                    {activeTeamMember.contact.email}
                  </a>
                  <a href={activeTeamMember.contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                    <ExternalLink className="contact-icon" />
                    LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="modal-button confirm"
              onClick={handlers.closeTeamModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <HomeNavbar />

      <main className="home-main">
        <CompanyOverviewSection />
        <MissionVisionSection />
        {/* <TeamSection /> */}
        {/* <ImpactStatsSection /> */}
        <CompanyValuesSection />
        {/* <TimelineSection /> */}
        <ContactSection />
      </main>

      <TeamMemberModal />
      <HomeFooter />
    </div>
  );
};

export default About;