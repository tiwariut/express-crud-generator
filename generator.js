const fs = require('fs');

const data = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));

const { resourceName, fields } = data;

const createModelFile = () => {
  let boilerplate = fs
    .readFileSync(`${__dirname}/boilerplates/model.js`, 'utf-8')
    .replace(/Sample/g, resourceName);

  let fieldsString = '';

  fields.map((field, i) => {
    const { key, type, required, defaultValue } = field;

    if (i > 0) {
      fieldsString += '    ';
    }

    fieldsString += `${key}: { type: ${type}, ${
      required ? 'required: true' : `default: ${defaultValue}`
    } }`;

    if (i < fields.length - 1) {
      fieldsString += ',\n';
    }
  });

  boilerplate = boilerplate.replace('/* Fields */', fieldsString);

  fs.writeFile(
    `${__dirname}/models/${resourceName}.js`,
    boilerplate,
    function (err) {
      if (err) console.log(err);
    }
  );
};

const createRouteFile = () => {
  let boilerplate = fs
    .readFileSync(`${__dirname}/boilerplates/route.js`, 'utf-8')
    .replace(/Sample/g, resourceName)
    .replace(/sample/g, resourceName.toLowerCase());

  fs.writeFile(
    `${__dirname}/routes/${resourceName.toLowerCase()}s.js`,
    boilerplate,
    function (err) {
      if (err) console.log(err);
    }
  );
};

const createValidationFile = () => {
  let boilerplate = fs
    .readFileSync(`${__dirname}/boilerplates/validation.js`, 'utf-8')
    .replace(/Sample/g, resourceName);

  let createSchemaString = '';
  let updateSchemaString = '';

  fields.map((field, i) => {
    let { key, type, required } = field;

    if (i > 0) {
      createSchemaString += '    ';
      updateSchemaString += '    ';
    }

    type = type.toLowerCase();

    createSchemaString += `${key}: Joi.${type}().${
      required ? 'required()' : 'optional()'
    }`;

    updateSchemaString += `${key}: Joi.${type}().${
      required ? 'optional()' : 'optional().allow("")'
    }`;

    if (i < fields.length - 1) {
      createSchemaString += ',\n';
      updateSchemaString += ',\n';
    }
  });

  boilerplate = boilerplate
    .replace('/* Create Schema */', createSchemaString)
    .replace('/* Update Schema */', updateSchemaString);

  fs.writeFile(
    `${__dirname}/middleware/validations/${resourceName.toLowerCase()}s.js`,
    boilerplate,
    function (err) {
      if (err) console.log(err);
    }
  );
};

const createControllerFile = () => {
  let boilerplate = fs
    .readFileSync(`${__dirname}/boilerplates/controller.js`, 'utf-8')
    .replace(/Sample/g, resourceName)
    .replace(/sample/g, resourceName.toLowerCase());

  let updateFieldsString = '';
  let updateLogicString = '';

  fields.map((field, i) => {
    let { key, type, required } = field;

    let resourceNameLowerCase = resourceName.toLowerCase();

    if (i > 0) {
      updateLogicString += '  ';
    }

    updateFieldsString += `${key}`;

    let condition;
    if (type === 'String') {
      condition = required ? `${key}` : `${key} || ${key} === ""`;
    } else if (type === 'Number') {
      condition = `${key} || ${key} === 0`;
    } else if (type === 'Boolean') {
      condition = `${key} || ${key} === false`;
    } else {
      condition = required ? `${key}` : `${key} || ${key} === ""`;
    }

    updateLogicString += `${resourceNameLowerCase}.${key} = ${condition} ? ${key} : ${resourceNameLowerCase}.${key}`;

    if (i < fields.length - 1) {
      updateFieldsString += ', ';
      updateLogicString += ',\n';
    }
  });

  boilerplate = boilerplate
    .replace('/* Update Fields */', updateFieldsString)
    .replace('/* Update Logic */', updateLogicString);

  fs.writeFile(
    `${__dirname}/controllers/${resourceName}Controller.js`,
    boilerplate,
    function (err) {
      if (err) console.log(err);
    }
  );
};

const createTransformerFile = () => {
  let boilerplate = fs
    .readFileSync(`${__dirname}/boilerplates/transformer.js`, 'utf-8')
    .replace(/sample/g, resourceName.toLowerCase());

  let resourceNameLowerCase = resourceName.toLowerCase();

  let listDataString = `_id: ${resourceNameLowerCase}._id,\n`;
  let singleDataString = '';

  fields.map((field, i) => {
    let { key } = field;

    listDataString += '          ';
    if (i > 0) {
      singleDataString += '        ';
    }

    listDataString += `${key}: ${resourceNameLowerCase}.${key},\n`;
    singleDataString += `${key}: data.${key},`;

    if (i < fields.length - 1) {
      // listDataString += "";
      singleDataString += '\n';
    }
  });

  listDataString += `          createdAt: ${resourceNameLowerCase}.createdAt,\n`;
  listDataString += `          updatedAt: ${resourceNameLowerCase}.updatedAt`;

  boilerplate = boilerplate
    .replace('/* List Data */', listDataString)
    .replace('/* Single Data */', singleDataString);

  fs.writeFile(
    `${__dirname}/transformers/${resourceName.toLowerCase()}s.js`,
    boilerplate,
    function (err) {
      if (err) console.log(err);
    }
  );
};

const updateLanguageFiles = () => {
  let langFileEN = fs.readFileSync(`${__dirname}/locales/en.json`, 'utf-8');
  let langFileIT = fs.readFileSync(`${__dirname}/locales/it.json`, 'utf-8');

  langFileEN = langFileEN.slice(0, -3);
  langFileIT = langFileIT.slice(0, -3);

  let resourceNameLowerCase = resourceName.toLowerCase();

  let string = `,\n  "${resourceNameLowerCase}s": {\n`;
  string += `    "${resourceNameLowerCase}Created": "${resourceName} created.",\n`;
  string += `    "notFound": "${resourceName} not found with the id of",\n`;
  string += `    "${resourceNameLowerCase}Found": "${resourceName} found.",\n`;
  string += `    "${resourceNameLowerCase}Updated": "${resourceName} updated.",\n`;
  string += `    "${resourceNameLowerCase}Deleted": "${resourceName} deleted."\n  }\n}`;

  langFileEN += string;
  langFileIT += string;

  fs.writeFile(`${__dirname}/locales/en.json`, langFileEN, function (err) {
    if (err) console.log(err);
  });

  fs.writeFile(`${__dirname}/locales/it.json`, langFileIT, function (err) {
    if (err) console.log(err);
  });
};

createModelFile();
createRouteFile();
createValidationFile();
createControllerFile();
createTransformerFile();
updateLanguageFiles();

console.log('Done!');
