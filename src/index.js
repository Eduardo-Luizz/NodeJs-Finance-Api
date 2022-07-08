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

app.get( "/statement", (request, response) => {
  const { cpf } = request.headers; // Passando o cpf pelo header
  const customer = customers.find(customer => customer.cpf === cpf); // Percorre o customers e verifica se o cpf passado está dentro do array
  
  if(!customer) {
    return response.status(400).json({ error: "CPF passado não existe" });
  }
  
  return response.status(200).send(customer)
});

app.listen(3030);
console.log('Starting server on port 3030');