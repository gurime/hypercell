import { useNavigate } from 'react-router-dom';

export default function NoPage() {
  const navigate = useNavigate();

  return (
    <>
       <div className="no-page-container">
      <div className="no-page-content">
        <h1 className="no-page-title">404 - Page Not Found</h1>
        <p className="no-page-description">
          Oops! The page you are looking for does not exist.
        </p>
        <button 
          onClick={() => navigate(-1)} 
          className="no-page-button"
        >
          Go Back
        </button>
      </div>
    </div>
    </>
  )
}