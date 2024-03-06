const fs = require("fs");

const data = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, "utf-8"));

const { resourceName, fields } = data;

const createModelFile = () => {
  try {
    const boilerplate = fs.readFileSync(
      `${__dirname}/boilerplates/model.js`,
      "utf-8"
    );
    if (!boilerplate.includes("/* Fields */")) {
      throw new Error(
        "Boilerplate file doesn't contain the /* Fields */ placeholder."
      );
    }

    let fieldsString = "";
    fields.forEach((field, i) => {
      const { key, type, required, defaultValue } = field;

      if (i > 0) {
        fieldsString += "    ";
      }

      fieldsString += `${key}: { type: ${type}, ${
        required ? "required: true" : `default: ${defaultValue}`
      } }`;

      if (i < fields.length - 1) {
        fieldsString += ",\n";
      }
    });

    const finalBoilerplate = boilerplate.replace("/* Fields */", fieldsString);

    const modelDirPath = `${__dirname}/server/models`;
    if (!fs.existsSync(modelDirPath)) {
      fs.mkdirSync(modelDirPath, { recursive: true });
      console.log(`Directory created: ${modelDirPath}`);
    }

    const modelFilePath = `${modelDirPath}/${resourceName}.js`;
    fs.writeFileSync(modelFilePath, finalBoilerplate, "utf-8");

    console.log(`Model file created successfully for ${resourceName}.`);
  } catch (err) {
    console.error("Error creating model file:", err);
  }
};

const createRouteFile = () => {
  try {
    let boilerplate = fs
      .readFileSync(`${__dirname}/boilerplates/route.js`, "utf-8")
      .replace(/Sample/g, resourceName)
      .replace(/sample/g, resourceName.toLowerCase());

    const modelDirPath = `${__dirname}/server/routes`;
    if (!fs.existsSync(modelDirPath)) {
      fs.mkdirSync(modelDirPath, { recursive: true });
      console.log(`Directory created: ${modelDirPath}`);
    }

    fs.writeFile(
      `${__dirname}/server/routes/${resourceName.toLowerCase()}s.js`,
      boilerplate,
      function (err) {
        if (err) console.log(err);
      }
    );
    console.log(`Route file created successfully for ${resourceName}.`);
  } catch (err) {
    console.error("Error creating route file:", err);
  }
};

const createValidationFile = () => {
  try {
    let boilerplate = fs
      .readFileSync(`${__dirname}/boilerplates/validation.js`, "utf-8")
      .replace(/Sample/g, resourceName);

    let createSchemaString = "";
    let updateSchemaString = "";

    fields.map((field, i) => {
      let { key, type, required } = field;

      if (i > 0) {
        createSchemaString += "    ";
        updateSchemaString += "    ";
      }

      type = type.toLowerCase();

      createSchemaString += `${key}: Joi.${type}().${
        required ? "required()" : "optional()"
      }`;

      updateSchemaString += `${key}: Joi.${type}().${
        required ? "optional()" : 'optional().allow("")'
      }`;

      if (i < fields.length - 1) {
        createSchemaString += ",\n";
        updateSchemaString += ",\n";
      }
    });

    boilerplate = boilerplate
      .replace("/* Create Schema */", createSchemaString)
      .replace("/* Update Schema */", updateSchemaString);

    const modelDirPath = `${__dirname}/server/middleware/validations`;
    if (!fs.existsSync(modelDirPath)) {
      fs.mkdirSync(modelDirPath, { recursive: true });
      console.log(`Directory created: ${modelDirPath}`);
    }

    fs.writeFile(
      `${__dirname}/server/middleware/validations/${resourceName.toLowerCase()}s.js`,
      boilerplate,
      function (err) {
        if (err) console.log(err);
      }
    );
    console.log(`Validation file created successfully for ${resourceName}.`);
  } catch (err) {
    console.error("Error creating validation file:", err);
  }
};

const createControllerFile = () => {
  try {
    let boilerplate = fs
      .readFileSync(`${__dirname}/boilerplates/controller.js`, "utf-8")
      .replace(/Sample/g, resourceName)
      .replace(/sample/g, resourceName.toLowerCase());

    let updateFieldsString = "";
    let updateLogicString = "";

    fields.map((field, i) => {
      let { key, type, required } = field;

      let resourceNameLowerCase = resourceName.toLowerCase();

      if (i > 0) {
        updateLogicString += "  ";
      }

      updateFieldsString += `${key}`;

      let condition;
      if (type === "String") {
        condition = required ? `${key}` : `${key} || ${key} === ""`;
      } else if (type === "Number") {
        condition = `${key} || ${key} === 0`;
      } else if (type === "Boolean") {
        condition = `${key} || ${key} === false`;
      } else {
        condition = required ? `${key}` : `${key} || ${key} === ""`;
      }

      updateLogicString += `${resourceNameLowerCase}.${key} = ${condition} ? ${key} : ${resourceNameLowerCase}.${key}`;

      if (i < fields.length - 1) {
        updateFieldsString += ", ";
        updateLogicString += ",\n";
      }
    });

    boilerplate = boilerplate
      .replace("/* Update Fields */", updateFieldsString)
      .replace("/* Update Logic */", updateLogicString);

    const modelDirPath = `${__dirname}/server/controllers`;
    if (!fs.existsSync(modelDirPath)) {
      fs.mkdirSync(modelDirPath, { recursive: true });
      console.log(`Directory created: ${modelDirPath}`);
    }

    fs.writeFile(
      `${__dirname}/server/controllers/${resourceName}Controller.js`,
      boilerplate,
      function (err) {
        if (err) console.log(err);
      }
    );
    console.log(`Controller file created successfully for ${resourceName}.`);
  } catch (err) {
    console.error("Error creating controller file:", err);
  }
};

const createTransformerFile = () => {
  try {
    let boilerplate = fs
      .readFileSync(`${__dirname}/boilerplates/transformer.js`, "utf-8")
      .replace(/sample/g, resourceName.toLowerCase());

    let resourceNameLowerCase = resourceName.toLowerCase();

    let listDataString = `_id: ${resourceNameLowerCase}._id,\n`;
    let singleDataString = "";

    fields.map((field, i) => {
      let { key } = field;

      listDataString += "          ";
      if (i > 0) {
        singleDataString += "        ";
      }

      listDataString += `${key}: ${resourceNameLowerCase}.${key},\n`;
      singleDataString += `${key}: data.${key},`;

      if (i < fields.length - 1) {
        // listDataString += "";
        singleDataString += "\n";
      }
    });

    listDataString += `          createdAt: ${resourceNameLowerCase}.createdAt,\n`;
    listDataString += `          updatedAt: ${resourceNameLowerCase}.updatedAt`;

    boilerplate = boilerplate
      .replace("/* List Data */", listDataString)
      .replace("/* Single Data */", singleDataString);

    const modelDirPath = `${__dirname}/server/transformers`;
    if (!fs.existsSync(modelDirPath)) {
      fs.mkdirSync(modelDirPath, { recursive: true });
      console.log(`Directory created: ${modelDirPath}`);
    }

    fs.writeFile(
      `${__dirname}/server/transformers/${resourceName.toLowerCase()}s.js`,
      boilerplate,
      function (err) {
        if (err) console.log(err);
      }
    );
    console.log(`Transformer file created successfully for ${resourceName}.`);
  } catch (err) {
    console.error("Error creating transformer file:", err);
  }
};

const updateLanguageFiles = () => {
  try {
    const langDirPath = `${__dirname}/server/locales`;
    const enFilePath = `${langDirPath}/en.json`;
    const itFilePath = `${langDirPath}/it.json`;

    // Create the locales directory if it doesn't exist
    if (!fs.existsSync(langDirPath)) {
      fs.mkdirSync(langDirPath, { recursive: true });
      console.log(`Directory created: ${langDirPath}`);
    }

    let langFileEN;
    let langFileIT;

    if (fs.existsSync(enFilePath)) {
      langFileEN = fs.readFileSync(enFilePath, "utf-8");
      langFileEN = langFileEN.slice(0, -3);
    } else {
      langFileEN = "{";
    }

    if (fs.existsSync(itFilePath)) {
      langFileIT = fs.readFileSync(itFilePath, "utf-8");
      langFileIT = langFileIT.slice(0, -3);
    } else {
      langFileIT = "{";
    }

    console.log("Existing EN file content:", langFileEN);
    console.log("Existing IT file content:", langFileIT);

    let resourceNameLowerCase = resourceName.toLowerCase();

    let string = `\n  "${resourceNameLowerCase}s": {\n`;
    string += `    "${resourceNameLowerCase}Created": "${resourceName} created.",\n`;
    string += `    "notFound": "${resourceName} not found with the id of",\n`;
    string += `    "${resourceNameLowerCase}Found": "${resourceName} found.",\n`;
    string += `    "${resourceNameLowerCase}Updated": "${resourceName} updated.",\n`;
    string += `    "${resourceNameLowerCase}Deleted": "${resourceName} deleted."\n  },\n }`;

    console.log("String to append:", string);

    langFileEN += string;
    langFileIT += string;

    console.log("Updated EN file content:", langFileEN);
    console.log("Updated IT file content:", langFileIT);

    fs.writeFileSync(enFilePath, langFileEN);
    fs.writeFileSync(itFilePath, langFileIT);

    console.log("Language files updated successfully.");
  } catch (error) {
    console.error("Error updating language files:", error);
  }
};

createModelFile();
createRouteFile();
createValidationFile();
createControllerFile();
createTransformerFile();
updateLanguageFiles();

console.log("Done!");
