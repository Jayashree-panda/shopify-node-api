// https://2940962d.ngrok.io/shopify?shop=dshskdhdk.myshopify.com
var express=require('express')
var dotenv=require('dotenv').config()
var cookie=require('cookie')
var nonce=require('nonce')()
var querystring=require('querystring')
var request=require('request-promise')
var apiKey=process.env.SHOPIFY_API_KEY;
var apiSecret=process.env.SHOPIFY_API_SECRET;
var shopifyAccessToken=process.env.SHOPIFY_ACCESS_TOKEN;
var forwardingAddress=" https://us-central1-shopscope-dev.cloudfunctions.net/api"//this changes everytime
const shopifyAPI = require('shopify-api-node');
const scopes='write_products'
const crypto=require('crypto')
var app=express()

//console.log("access_token"+shopifyAccessToken)
app.get('/',(req,res)=>{
    res.send("starts")
})

// var Shopify = new shopifyAPI({
//   shop: 'MYSHOP', // MYSHOP.myshopify.com
//   shopify_api_key: '', // Your API key
//   shopify_shared_secret: '', // Your Shared Secret
//   shopify_scope: 'write_products',
//   redirect_uri: 'http://localhost:3000/finish_auth',
//   nonce: '' // you must provide a randomly selected value unique for each authorization request
// });


app.get('/shopify',(req,res)=>{
  const shop=req.query.shop;
  //console.log("megha")
  if(shop){
    const state=nonce()
    const redirectUri=forwardingAddress+'/shopify/callback'
    const installUri= 'https://'+shop+
    '/admin/oauth/authorize?client_id='+apiKey+
    '&scope='+scopes+
    '&state='+state+
    '&redirect_uri='+redirectUri;
    res.cookie('state',state);
    res.redirect(installUri);
  }else{
    res.status(400).send('missing shop parameter')  
  }
})

 app.get('/shopify/product',(req,res)=>{
   const shop=req.query.shop;
   console.log(shop)
   const productRequestUrl='https://'+shop+'/admin/api/2019-04/products.json'
  // const productRequestUrl='https://'+shop+'/admin/api/2019-04/products.json'
      
  const productRequestHeader={
    'X-Shopify-Access-Token':shopifyAccessToken,
    'content-type':'application/json'
  }
  request.get(productRequestUrl,{headers:productRequestHeader})
      .then((productResponse)=>{

        var productData = JSON.parse(productResponse);
        var products=productData.products;
        //console.log("products"+products)
        var productDetails={}
        for(x in products)
        {
          var originalVariants={}//change
          var newstock={}
          var newSize=[]
          //console.log(x)
          var singleProduct=products[x]
          var singleProductKey=singleProduct.title
          
          console.log("singleProductKey"+singleProduct)
          var newProduct={
          actualPrice:null,
          allproducts:{},//change
          category_id:null,
          category_name:null,
          description:null,
          image:null,
          instock:{},
          locationid:null,
          manufacturer:null,
          name:null,
          no_size:null,
          price:null,
          quantity:null,
          self_id:null,
          seller_id:null,
          size:{},
          sku:null,
          shopifyAccessToken:null,
          store_id:null,
          sync:null,
          tag:null,
          thumbnail:null,
          total_qty:null
        }
        newProduct.actualPrice=singleProduct.variants[0].price//if the price of all variants are same
       // console.log("newp"+newProduct.actualPrice)
        for(y in singleProduct.variants)
        {
          //console.log(singleProduct.variants[y])
          
          var singleVariant=singleProduct.variants[y]
          //console.log("singleVariant"+singleVariant)
          // var newInstock={
          //   name:null,
          //   quantity:null,
          //   size:null
          // }
          var newVariant={
            actualPrice:null,
            attributeSetId:null,
            category_id:null,
            category_name:null,
            configname:null,
            image:null,
            locationId:null,
            magento_id:null,
            name:null,
            parent_id:null,
            parentname:null,
            price:null,
            quantity:null,
            seller_id:null,
            size:[],//review
            sku:null,
            shopifyAccessToken:null,
            store_id:null,
            sync:null,
            tag:null,
            thumbnail:null,
            total_qty:null
          }
          
         
          newVariant.actualPrice=singleVariant.price
          
          newVariant.category_name=singleProduct.product_type
          //console.log("jj "+newVariant.category_name)
          newVariant.image=singleProduct.image.src
          //console.log("image"+newVariant.image)
          newVariant.name=singleProduct.title
          //console.log(newVariant.name)
          newVariant.parent_id=singleProduct.title
          newVariant.parentname=singleProduct.title
          //console.log("newVariant"+newVariant.parent_id)
          newVariant.price=singleVariant.price
          //console.log("newVariant"+newVariant.price)
          newVariant.quantity=singleVariant.inventory_quantity
          //console.log("newVariant"+newVariant.quantity)
          newVariant.size.push(singleVariant.option1)
          //console.log("newVariant"+newVariant.size)
          newVariant.total_qty=singleVariant.inventory_quantity
          // newInstock.name=singleProduct.title
          // newInstock.quantity=singleVariant.inventory_quantity
          // newInstock.size=singleVariant.option1
          newVariant.sku=singleProduct.title+'-'+singleVariant.option1
          newSize.size=singleVariant.option1

          newProduct.total_qty=newProduct.total_qty+singleVariant.inventory_quantity
          newProduct.shopifyAccessToken=shopifyAccessToken
          //console.log(newInstock.size)
          // secondone.size=singleVariant.option1
          // secondone.quantity=singleProduct.inventory_quantity
          // newInstock.push(secondone)
          //newsize.push(singleVariant.option1)
          

         var variantKey = singleProduct.title+'-'+singleVariant.option1;

          //console.log("prod"+variantKey)
          originalVariants[variantKey]=newVariant
          var instockKey=singleProduct.title+'-'+singleVariant.option1;
          newstock[instockKey]=singleVariant.inventory_quantity
         // originalVariants.push(newVariant)
          //newstock.push(newInstock)
          //newsize.push(newSize)
        }
        
        newProduct.allproducts=originalVariants
        //console.log("ss"+singleProduct.allproducts)
        newProduct.instock=newstock
        newProduct.size=newSize
        //console.log(newProduct.size)

        // newProduct.instock=newInstock
        // console.log(newProduct.instock)
        newProduct.category_name=singleProduct.product_type
        //console.log("newVariant"+newProduct.category_name)
        newProduct.description=singleProduct.body_html
        //console.log("newVariant"+newProduct.description)
        newProduct.image=singleProduct.image.src
        //console.log("newVariant"+newProduct.image)
        newProduct.name=singleProduct.title
        newProduct.price=singleVariant.price
        
        productDetails[singleProductKey]=newProduct
       
}



      //res.send(productData)
        
        
        //res.status(200).send(productDetails)
        
        res.send(productDetails)
       // console.log("productResponse"+productData.products[0].id)
      })
      .catch((error)=>{
        console.log(error)
        res.status(400).send("can't get the product");
      })
  
})
app.get('/shopify/callback',(req,res)=>{
  console.log("dhgfdh")
  const {shop,code,state,hmac}=req.query
  console.log('req.query'+req.query)
  const stateCookie=cookie.parse(req.headers.cookie).state

  if(stateCookie!=state)
  {
    return res.status(400).send("invalid match")
  }
  if(shop && hmac && code){
    const map=Object.assign({},req.query)
    delete map['hmac']
    delete map['signature']
    const message=querystring.stringify(map)
    const providedHmac=Buffer.from(hmac,'utf-8')
    console.log('hmac'+providedHmac)
    const generatedHash=Buffer.from(crypto
    .createHmac('sha256','0f1d644d66600ae5e15f961d7fb1dddb')
    .update(message)
    .digest('hex'),
    'utf-8'
    );
    console.log("generatedHash"+generatedHash)
  let hashEquals=false
  try{
     hashEquals=crypto.timingSafeEqual(generatedHash,providedHmac)
  }
  catch(e){
    hashEquals=false
  };
  console.log("hashequals"+hashEquals)
    if(!hashEquals)
    {
      return res.status(400).send("HMAC not validated")
    }
    
    const accessTokenRequestUrl='https://'+ shop +'/admin/oauth/access_token'
    const accessTokenPayload={
      client_id:apiKey,
      client_secret:'a765b95b5f89b14b000d9a2753755885',
      code,
    }
    console.log("client_id"+accessTokenPayload.client_id)
    console.log("client_secret"+accessTokenPayload.client_secret)
    request.post(accessTokenRequestUrl,{json:accessTokenPayload})
    .then((accessResponse)=>{
      const access_token=accessResponse.access_token
      console.log(access_token)
      // const shopRequestUrl='https://'+shop+'/admin/api/2019-04/products.json?fields=id,title'
      // //const shopProduct='https://'+shop+'/admin/api/2019-04/products.json'
      //  const shopRequestHeader={
      // 'X-Shopify-Access-Token':access_token,
      // 'content-type':'application/json'
    
   
    // request.get(shopRequestUrl,{headers:shopRequestHeader})
    //   .then((shopResponse)=>{
    //     console.log(shopResponse)
    //     res.status(200).end(shopResponse)
      
    //   })
    //   .catch((error)=>{
    //     console.log(error)
    //     res.status(400).send("can't get the product");
    //   })

                  
    }
    )
    .catch((e)=>{
      res.status(400).send("access token not found")
    })
  

    
  }else{
     res.status(400).send('required parameters are missing')
  }
})

  




app.listen(3000,()=>{
  console.log("server listening on port 3000")
})

