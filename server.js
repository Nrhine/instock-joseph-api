import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const PORT = process.env.PORT || 8081;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// home route
app.get('/', (req, res) => {
  res.send('Welcome to the InStock API');
});

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
