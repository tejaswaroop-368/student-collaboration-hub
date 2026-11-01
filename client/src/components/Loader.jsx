import Spinner from 'react-bootstrap/Spinner';

const Loader = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 position-fixed top-0 start-0 w-100 bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
            <div className='text-center'>
                <Spinner animation="border" role="status" className='text-primary mb-3' style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className='text-muted fw-semibold mt-3'>Loading...</p>
            </div>
        </div>
    );
}

export default Loader;