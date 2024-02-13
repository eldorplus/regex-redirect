import express from 'express';
import path from 'path';

const app = express();
const router = express.Router();
const port = 8080;

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.json());
app.use(express.static('public'))
app.use('/', router);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});