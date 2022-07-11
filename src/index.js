const express = require("express");
const { v4: uuidv4 } = require("uuid"); // v4: uuidv4 renomeei a funcao

const app = express();

// middleware para trabalhar com json
app.use(express.json());

const customers = [] // Banco de dados fake

/* Dados da conta
* cpf - string
* name - string
* id - uuid
* statement [] 
*/

// middleware valida cpf
function verifyIfExistsAccountCPF(request, response, next) { // next define se o middleware segue ou para aonde está
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) {
    return response.status(400).json({ error: "CPF passado não existe" });
  }

  request.customer = customer; // Dessa maneira quem chama o middleware tem acesso ao customer

  return next();
}

app.post("/", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf); // some retorna true or false de acordo com a condicao 

  if(customerAlreadyExists === true) {
    return response.status(400).json({ error: "CPF já existe" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  });
  return response.status(201).send(request.body);
}); 

app.get( "/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request; // Busca essa informação de dentro do middleware
  return response.json(customer.statement);
});

app.listen(3030);
console.log('Starting server on port 3030');