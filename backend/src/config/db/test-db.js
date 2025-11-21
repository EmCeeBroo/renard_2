import { testConnection} from './connect.js';

async function test() {
    console.log('Testing database connection. . . 🔎');
    const success = await testConnection();
    if (success) {
        console.log('All good! Database is ready for user. ✨🚀');
    } else {
        console.log('PLease check the database setup.');
    }
}

test();