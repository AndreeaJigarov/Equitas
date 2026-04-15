import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/AuthComponents/RegisterForm';

export const RegisterPage = () => {
    const navigate = useNavigate();

    const handleRegisterSuccess = () => {
        navigate('/login'); // Redirect to login after successful registration
    };

    return (
        <div className="page-fade-in">
            <RegisterForm onRegister={handleRegisterSuccess} />
            <p style={{ textAlign: 'center', marginTop: '-2rem', color: 'var(--white)', position: 'relative', zIndex: 10 }}>
                Already have an account?
                <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}>
          Log in
        </span>
            </p>
        </div>
    );
};