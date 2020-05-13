//Budget Controller
//IIFE Imedietly invoked function expressions for security reasons
//you cannot access the controllers data from outside unless it retuerning somethig
//These functions are more likely anonymous functions


//////////////////////////////////Budget Controller//////////////////////////////////////////

var BudgetController = (function() {

    var Expenses=function (id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    Expenses.prototype.calcPercentage=function(totalIncome){
        
        if(totalIncome>0){
            this.percentage= Math.round((this.value/totalIncome)*100);
        }else
        {
            this.percentage= -1;
        }
        
        
    };
    Expenses.prototype.getPercentage=function(){
        return this.percentage;
    };
    var Income=function (id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
    }
    var data={
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: 0

    }
    var caluclateBudget= function(type){
        var sum=0;
        data.allItems[type].forEach(function(crr)
        {
            sum+=crr.value;
        });
        data.totals[type]=sum;
    };
    return{
        addItems: function (type,desc,val) {
            var newItem,id;
            if(data.allItems[type].length>1){
                id=data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                id=0;
            }
            
            if(type==='exp')
            {
                newItem=new Expenses(id,desc,val);
            }else if(type==='inc')
            {
                newItem= new Income(id,desc,val);
            }
            else{
                console.log('Dont Play with my code :)');
                
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItems: function(type,id){
            var ids,index;
            ids=data.allItems[type.substring(0,3)].map(function(current){
                return current.id;
            });
            index=ids.indexOf(id);
            
            if(index !==-1){
                data.allItems[type.substring(0,3)].splice(index,1);
            }

        },
        budgetCaluclator: function(type){
            caluclateBudget('inc');
            caluclateBudget('exp');
            data.budget=data.totals.inc-data.totals.exp;
            if(data.budget>0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }
            else{
                data.percentage=0;
            }
        },
        caluclatePercentages: function(){
            data.allItems.exp.forEach(function(currenrt){
                currenrt.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPercent=data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            }
            
            );
            return allPercent;
        },
        getBudgtDetails: function(){
            return {
                incomeTotal:data.totals.inc,
                expTotal:data.totals.exp,
                totalBudget:data.budget,
                budgetPercent:data.percentage
            };
        }
    }

})();

///////////////////////////////////////UI Controller//////////////////////////////////////////////

var UIController = (function() {
    //For DRY purpose defined all the reuseble strings
    UserStrings={
        inputType: '.add__type',
        inputDescripion: '.add__description',
        inputValue: '.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLable:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        month: '.budget__title--month',
        exppercentLabel:'.budget__expenses--percentage',
        itemPercentage: '.item__percentage',
        month:'.budget__title--month'
    };
    var formatNumber=function(num,type){
        var numSplit,int,dec;
        num=Math.abs(num);
        num=num.toFixed(2);
        numSplit=num.split('.');
        int=numSplit[0];
        if(int.length>3){
            int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);

        }
        dec=numSplit[1];
        return (type==='inc'?'+':'-')+' '+int+'.'+dec;
    };
    var nodeListforEach=function(list,callback){
        for(i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };
    return {
        //return the user strings and user input to the main controller
        getUserInput: function(){
            return{
                type: document.querySelector(UserStrings.inputType).value,//based on user selection income or expense
                description: document.querySelector(UserStrings.inputDescripion).value,
                value: parseFloat(document.querySelector(UserStrings.inputValue).value)
            };

        },
        deleteListItemUI: function(id){
            var ei=document.getElementById(id);
            ei.parentNode.removeChild(ei);
        },
        addItemList: function(type,obj){
            var elemment,html,newHtml;
            //Create Html Element
            if(type==='inc')
            {
                elemment=UserStrings.incomeContainer;
                html='<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type==='exp')
            {
                elemment=UserStrings.expenseContainer;
                html='<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace placeholders and save it into new html element
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            //Inerser new html to list as child element
            document.querySelector(elemment).insertAdjacentHTML('beforeend',newHtml);
            
        },
        clarFileds: function(){
            var fields,fieldsArr;
            fields=document.querySelectorAll(UserStrings.inputDescripion+','+UserStrings.inputValue)
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array) {
                current.value="";
            });
            fieldsArr[0].focus();
        },
        updateBudgetinUI: function(obj){
            var type='exp';
            if(obj.totalBudget>0){
                type='inc'
            } 
            document.querySelector(UserStrings.budgetLabel).textContent=formatNumber(obj.totalBudget,type);
            document.querySelector(UserStrings.incomeLable).textContent=formatNumber(obj.incomeTotal,'inc');
            document.querySelector(UserStrings.expenseLabel).textContent=formatNumber(obj.expTotal,'exp');
            //console.log(obj.budgetPercent);
            
            if(obj.budgetPercent>0 )
            {
                document.querySelector(UserStrings.percentageLabel).textContent=obj.budgetPercent+'%';
            }
            else{
                document.querySelector(UserStrings.percentageLabel).textContent='0%';
            }
            
        },
        displayPercentages: function(percentages){
            var fields=document.querySelectorAll(UserStrings.itemPercentage);
            nodeListforEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+ '%';
                }else{
                    current.textContent='0%';
                }

            });
        },
        displayMonth:function(){
            var date= new Date();
            var month=date.getMonth();
            var year=date.getFullYear();
            var months=['january','February','March','April','May','June','July','Agust','Spetember','October','Nobember','December']
            document.querySelector(UserStrings.month).textContent=months[month]+' '+year;
        },
        chnagedType: function(){
            var fields=document.querySelectorAll(UserStrings.inputType+','+
            UserStrings.inputDescripion+','+UserStrings.inputValue
            );
            nodeListforEach(fields,function(curr) {
                curr.classList.toggle('red-focus');

            });
            document.querySelector(UserStrings.inputBtn).classList.toggle('red')
        },
        getUserStrings: function(){
            return UserStrings;
        }
    };
  

})();
/////////////////////////////////////////Main Controller////////////////////////////////////////////////////
var controller =(function (budgetCtrl, UICtrl) {
    //Event listner for enter key the value of the enter key is 13 :)
    var setEventListner=(function(){
        var userStr=UICtrl.getUserStrings();
        document.querySelector(userStr.inputBtn).addEventListener('click' ,ctrlAddItem);
        document.querySelector(userStr.inputType).addEventListener('change',UICtrl.chnagedType);
        document.addEventListener('keypress',function (event) {
            
            if(event.keyCode ===13 || event.which === 13){
                ctrlAddItem();
            }
            
        });
        document.querySelector(UserStrings.container).addEventListener('click',deleteItem);
    })
    //document.querySelector(UserStrings.deleteButton).addEventListener('click',deleteItem);

    var updateBudjet = function(){
        //caluclate Budject
        budgetCtrl.budgetCaluclator();
        var budget=budgetCtrl.getBudgtDetails();
        UICtrl.updateBudgetinUI(budget);
    };
    var updatePercentage=function(){
        budgetCtrl.caluclatePercentages();
        var percArr=budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percArr);
    };
    
    var ctrlAddItem = function () {
        var input,newItem;
        //creates input object from user input values with type,description,value
        input= UICtrl.getUserInput();
        if(input.description!=="" && !isNaN(input.value) && input.value>0)
        {
            //Add item to the budget controller
            newItem=budgetCtrl.addItems(input.type,input.description,input.value);
            //Add List to UI
            UICtrl.addItemList(input.type,newItem);
            //clear fields
            UICtrl.clarFileds();
            //call UpdateBudget to caluclate and display values i UI
            updateBudjet();
            updatePercentage();
        
        }
        

    };
    var deleteItem=(function(event){
        var itemId,splitId,type,ID;
        //console.log(event);
        
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId=itemId.split('-');
            type=splitId[0];
            ID=parseInt(splitId[1]);
            budgetCtrl.deleteItems(type,ID);
            UICtrl.deleteListItemUI(itemId);
            updateBudjet();


        } 

    });

    return{
        init: function(){
            UICtrl.updateBudgetinUI({
                incomeTotal:0,
                expTotal:0,
                totalBudget:0,
                budgetPercent:-1
            });
            //console.log('I\'m Working');
            setEventListner();
            UICtrl.displayMonth();
        }
    };

})(BudgetController,UIController);


controller.init();//Initialization Method
