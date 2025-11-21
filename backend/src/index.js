import app, { showServerLink } from './app/app.js';
import dotenv from 'dotenv';

dotenv.config({path:'../env'});
const PORT = process.env.PORT || 3000;

//Start the server
/*app.listen(PORT, () => {
    showServerLink(PORT);
});*/

//Start the server
app.listen(PORT, '0.0.0.0', () => {
  showServerLink(PORT, true);
});

