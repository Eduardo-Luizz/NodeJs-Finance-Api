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

// Função que pega o balanco da conta
function getbalance(statement) {
  const balance = statement.reduce((acumulador, operation) => { // reduce pega as informações que forem passadas para ela e transforma essas informações em um único valor
    if (operation.type === "credit") {
      return acumulador + operation.amount;
    } else {
      return acumulador - operation.amount;
    };
  }, 0); // É preciso iniciar o reduce com algum valor

  console.log(balance);
  return balance;
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

app.post( "/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post( "/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body; // Recebendo a quantida para fazer o saque
  const { customer } = request;
  const  balance  = getbalance(customer.statement);

  if (balance < amount) {
    return response.status(400).send({ error: "Fundos insuficientes para realizar o saque" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get( "/statement/date", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;
  const dateFormat = new Date(date + "00:00");

  const statement = customer.statement.filter(( statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

  return response.json(statement);
});

app.listen(3030);
console.log('Starting server on port 3030');