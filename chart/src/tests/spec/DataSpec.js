describe("Chart Data",function(){
  var P = KISSY.namespace("Gallery.Chart");
  var data, json1, data2, json2;


  beforeEach(function() {
      json1 = {
        type : "Line",
        element : {
          datas : [1,2,3,4],
          labels : ["n","b","n","c"],
          names : ["a1","a2","a3","a4"],
          format : "0.00"
        }
      };
      json2 = {
        type : "Line",
        element : {
          datas : [1,2,3,4],
          labels : ["n","b","n","c"],
          names : ["a1","a2","a3","a4"],
          format : "0.00"
        }
      };
      data = new P.Data(json1);
      data2 = new P.Data(json2);
  });

  it("sould return the right form of type", function() {
    expect(data.type).toEqual("line");
  });

  it("sould recognize the element and turn it into array", function() {
    var elements = data.elements();
    expect(elements.length).toEqual(4);
    expect(elements[3].name).toEqual("a4");
    expect(elements[1].format).toEqual("0.00");
  });

});
