const Template = require("../models/Template");
const { ObjectId } = require("mongodb");
const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);


const getAllSendgridTemplates = async (req, res) => {
  try {
    const queryParams = {
      generations: "dynamic",
      page_size: 18,
    };

    const request = {
      url: `/v3/templates`,
      method: "GET",
      qs: queryParams,
    };

   client
      .request(request)
      .then(([response, body]) => {
       res.status(200).send(response.body.result);
      })
      .catch((error) => {
        console.error(error);
        res.status(400).send({ error: error.message });
      });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const saveTemplate = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {
      const { template_id, role,templateType,status } = req.body;
      const template = new Template({
        template_id,
        role,
        templateType,
        status
      });
      let saved;
      let template_data =  await Template.find({templateType:req.body.templateType});

      if(template_data.length<=0){
        console.log("1")
        saved = await template.save();
        if (saved) {
          res.status(200).send({message : "Template saved successfully"});
        } else {
          res.status(400).send("Something went wrong");
        }
      }else{
        console.log("1fds")

        saved = await Template.updateOne(
          { _id: template_data[0]._id },
          {
            $set: {
              ...req.body
            },
          }
        );
        res.status(200).send({message : "Template saved successfully"});

      }

    } else {
      res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
};
const templateListingByAdmin = async (req, res) => {
  try {
    if (req.role === "ADMINISTRATOR") {getTemplate
      const queryParams = {
      generations: "dynamic",
      page_size: 18,
    };

    const request = {
      url: `/v3/templates`,
      method: "GET",
      qs: queryParams,
    };
    let sendgrid_templates = await client.request(request);
    let all_templates = await Template.find().sort({ index: 1 });
      if (all_templates && all_templates.length > 0) {
        for(let obj of sendgrid_templates[0].body.result){
          for(let items of all_templates){
            if(obj.id == items.template_id){
              items["name"] = obj.name
            }
          }
        }
        return res.status(200).send({data:all_templates,sendgrid_templates :sendgrid_templates[0].body.result});
      } else {
        return res.status(200).send({data:[],sendgrid_templates :sendgrid_templates[0].body.result});
      }
    } else {
      return res.status(400).send({ error: "Admin Permission required" });
    }
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
};
const getTemplate = async (template) => {
  try {
     let template_data = await Template.find( {$and: [ { templateType: template.templateType }, { status:  true } ] });
      if (template_data && template_data.length > 0) {
        return template_data;
      } else {
         return [];
      }
    } catch (err) {
    return err.message ;
  }
};




module.exports = {
  getAllSendgridTemplates,
  saveTemplate,
  templateListingByAdmin,
  getTemplate
};
