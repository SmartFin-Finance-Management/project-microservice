import app from './app';
import connectDB from './config/database';

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log('Server is running on port 4000');
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });