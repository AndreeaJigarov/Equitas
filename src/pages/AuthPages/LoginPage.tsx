import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/AuthComponents/LoginForm';

export const LoginPage = () => {
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        // In Assignment 1, we just redirect to the horses list
        navigate('/horses');
    };

    return (
        <div className="page-fade-in">
            <LoginForm onLogin={handleLoginSuccess} />
            <p style={{ textAlign: 'center', marginTop: '-2rem', color: 'var(--white)', position: 'relative', zIndex: 10 }}>
                Don't have an account?
                <span onClick={() => navigate('/register')} style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}>
          Sign up
        </span>
            </p>
        </div>
    );
};