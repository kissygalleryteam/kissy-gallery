describe("Data",function(){
  var P = KISSY.namespace("Gallery.Chart");
  var data,
      json1 = {
         type : "Line",
         element : {
           data : [1,2,3,4],
             label : ["n","b","n","c"],
             name : ["a1","a2","a3","a4"]
           }
        };

  beforeEach(function() {
      data = new P.Data(json1);
      console.log(data)
  });

  it("sould return the right form of type", function() {
    expect(data.type).toEqual("line");
  });

});
