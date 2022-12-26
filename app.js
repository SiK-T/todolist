const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin:test123@cluster0.wwho831.mongodb.net/todolistDB");

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: {
    type: String,
    required: true
  },

  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const eat = new Item ({
  name: "Eat"
});

const coffee = new Item ({
  name: "Drink Coffee"
});

const study = new Item ({
  name: "Study"
});

const startingItems = [eat, coffee, study];

app.get("/", function(req, res) {

  Item.find((err, items) => {
    if (err) {
      console.log(err);
    } else {

      if (items.length === 0){
        Item.insertMany(startingItems, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Inserted starting items");
          }
          res.redirect("/");
        });
      } else {
        res.render("list", {listTitle: "Today", newListItems: items});
      }}
  });
});

app.get("/:list", (req, res) => {
  listName = _.capitalize(req.params.list);

  List.findOne({name: listName}, (err, result)=>{
    if (err) {
      console.log(err);
    } else {
      if (!result) {

        const list = new List({
          name: listName,
          items: startingItems
        });
      
        list.save();

        res.redirect("/" + listName)
      } else {
        
        res.render("list", {listTitle: listName, newListItems: result.items})
      }
    }
  });

  

  // res.render("list", {listTitle: listName, newListItems: items});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save()
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, result)=>{
      if (err) {
        console.log(err);
      } else {
        result.items.push(item);
        result.save();
        res.redirect("/" + listName);
      }
    });
  }


});

app.post('/delete', (req, res) => {
  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today"){
    Item.findByIdAndRemove({_id: itemID}, (err)=> {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/")

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}}, (err, results) => {
      if (err){
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  }




});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
