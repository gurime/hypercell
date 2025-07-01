import React, { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('politics');

  const showCategory = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <>
      <Navbar/>
      <div className="main-container">
        <div className="category-tabs">
          <button 
            className={`tab-button ${activeCategory === 'politics' ? 'active' : ''}`} 
            onClick={() => showCategory('politics')}
          >
            Politics
          </button>
          <button 
            className={`tab-button ${activeCategory === 'sports' ? 'active' : ''}`} 
            onClick={() => showCategory('sports')}
          >
            Sports
          </button>
          <button 
            className={`tab-button ${activeCategory === 'music' ? 'active' : ''}`} 
            onClick={() => showCategory('music')}
          >
            Music
          </button>
          <button 
            className={`tab-button ${activeCategory === 'fashion' ? 'active' : ''}`} 
            onClick={() => showCategory('fashion')}
          >
            Fashion
          </button>
          <button 
            className={`tab-button ${activeCategory === 'gaming' ? 'active' : ''}`} 
            onClick={() => showCategory('gaming')}
          >
            Gaming
          </button>
          <button 
            className={`tab-button ${activeCategory === 'tech' ? 'active' : ''}`} 
            onClick={() => showCategory('tech')}
          >
            Tech
          </button>
        </div>

        <div className="content-area">
          <div 
            id="politics" 
            className={`category-content politics ${activeCategory === 'politics' ? 'active' : ''}`}
          >
            <div className="business-posts">
              <h2 className="section-title">Featured Political News</h2>
              <div className="post-card">
                <div className="business-badge">Business Post</div>
                <div className="post-title">Major Policy Changes Announced</div>
                <div className="post-meta">By Political News Network • 2 hours ago</div>
                <div className="post-excerpt">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</div>
              </div>
            </div>

            <div className="user-posts">
              <h2 className="section-title">Community Discussions</h2>
              <div className="post-card">
                <div className="post-title">What do you think about the new policies?</div>
                <div className="post-meta">By @user123 • 4 hours ago • 23 comments</div>
                <div className="post-excerpt">I've been following the recent announcements and wanted to get everyone's thoughts...</div>
              </div>
              <div className="post-card">
                <div className="post-title">Local election updates</div>
                <div className="post-meta">By @politicalwatcher • 6 hours ago • 8 comments</div>
                <div className="post-excerpt">Here's what's happening in our local political scene...</div>
              </div>
            </div>
          </div>

          <div 
            id="sports" 
            className={`category-content sports ${activeCategory === 'sports' ? 'active' : ''}`}
          >
            <div className="business-posts">
              <h2 className="section-title">Sports Headlines</h2>
              <div className="post-card">
                <div className="business-badge">Business Post</div>
                <div className="post-title">Championship Finals This Weekend</div>
                <div className="post-meta">By Sports Central • 1 hour ago</div>
                <div className="post-excerpt">The biggest game of the season is coming up this weekend...</div>
              </div>
            </div>

            <div className="user-posts">
              <h2 className="section-title">Fan Discussions</h2>
              <div className="post-card">
                <div className="post-title">Who's going to win the championship?</div>
                <div className="post-meta">By @sportsfan99 • 3 hours ago • 45 comments</div>
                <div className="post-excerpt">I think Team A has a real shot this year. What does everyone else think?</div>
              </div>
            </div>
          </div>

          <div 
            id="music" 
            className={`category-content music ${activeCategory === 'music' ? 'active' : ''}`}
          >
            <div className="business-posts">
              <h2 className="section-title">Music News</h2>
              <div className="post-card">
                <div className="business-badge">Business Post</div>
                <div className="post-title">New Album Releases This Week</div>
                <div className="post-meta">By Music Weekly • 30 minutes ago</div>
                <div className="post-excerpt">Check out the hottest new releases hitting the charts...</div>
              </div>
            </div>

            <div className="user-posts">
              <h2 className="section-title">Music Community</h2>
              <div className="post-card">
                <div className="post-title">What's everyone listening to?</div>
                <div className="post-meta">By @musiclover • 2 hours ago • 12 comments</div>
                <div className="post-excerpt">Share your current favorite songs and artists!</div>
              </div>
            </div>
          </div>

          <div 
            id="fashion" 
            className={`category-content fashion ${activeCategory === 'fashion' ? 'active' : ''}`}
          >
            <div className="business-posts">
              <h2 className="section-title">Fashion Trends</h2>
              <div className="post-card">
                <div className="business-badge">Business Post</div>
                <div className="post-title">Summer Fashion Trends 2025</div>
                <div className="post-meta">By Style Magazine • 4 hours ago</div>
                <div className="post-excerpt">Discover the hottest trends for this summer season...</div>
              </div>
            </div>

            <div className="user-posts">
              <h2 className="section-title">Style Community</h2>
              <div className="post-card">
                <div className="post-title">OOTD - Office look</div>
                <div className="post-meta">By @stylista • 5 hours ago • 8 comments</div>
                <div className="post-excerpt">Here's my professional outfit for today's important meeting...</div>
              </div>
            </div>
          </div>

          <div 
            id="gaming" 
            className={`category-content gaming ${activeCategory === 'gaming' ? 'active' : ''}`}
          >
            <div className="business-posts">
              <h2 className="section-title">Gaming News</h2>
              <div className="post-card">
                <div className="business-badge">Business Post</div>
                <div className="post-title">New Game Releases This Month</div>
                <div className="post-meta">By Game Central • 1 hour ago</div>
                <div className="post-excerpt">The most anticipated games are finally here...</div>
              </div>
            </div>

            <div className="user-posts">
              <h2 className="section-title">Gaming Community</h2>
              <div className="post-card">
                <div className="post-title">Looking for team members!</div>
                <div className="post-meta">By @progamer • 3 hours ago • 15 comments</div>
                <div className="post-excerpt">Need skilled players for competitive matches...</div>
              </div>
            </div>
          </div>

          <div 
            id="tech" 
            className={`category-content tech ${activeCategory === 'tech' ? 'active' : ''}`}
          >
            <div className="business-posts">
              <h2 className="section-title">Tech News</h2>
              <div className="post-card">
                <div className="business-badge">Business Post</div>
                <div className="post-title">AI Breakthrough Announced</div>
                <div className="post-meta">By Tech Today • 2 hours ago</div>
                <div className="post-excerpt">Revolutionary advances in artificial intelligence technology...</div>
              </div>
            </div>

            <div className="user-posts">
              <h2 className="section-title">Tech Community</h2>
              <div className="post-card">
                <div className="post-title">Anyone tried the new framework?</div>
                <div className="post-meta">By @developer • 4 hours ago • 22 comments</div>
                <div className="post-excerpt">I've been experimenting with the latest development tools...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}