const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
}).timeout(20000);

it('lets seller put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let seller = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
}).timeout(20000);

it('lets seller get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let seller = accounts[0];
    let buyer = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});
    await instance.approveRecipient(starId, buyer, {from: seller});
    let balanceOfsellerBeforeTransaction = await web3.eth.getBalance(seller);
    await instance.buyStar(starId, {from: buyer, value: balance});
    let balanceOfsellerAfterTransaction = await web3.eth.getBalance(seller);
    let value1 = Number(balanceOfsellerBeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfsellerAfterTransaction);
    assert.equal(value1, value2);
}).timeout(20000);

it('lets buyer buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let seller = accounts[1];
    let buyer = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});
    await instance.approveRecipient(starId, buyer, {from: seller});
    let balanceOfsellerBeforeTransaction = await web3.eth.getBalance(buyer);
    await instance.buyStar(starId, {from: buyer, value: balance});
    assert.equal(await instance.ownerOf.call(starId), buyer);
}).timeout(20000);

it('lets buyer buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let seller = accounts[1];
    let buyer = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});
    await instance.approveRecipient(starId, buyer, {from: seller});
    let balanceOfsellerBeforeTransaction = await web3.eth.getBalance(buyer);
    const balanceOfbuyerBeforeTransaction = await web3.eth.getBalance(buyer);
    await instance.buyStar(starId, {from: buyer, value: balance, gasPrice:0});
    const balanceAfterbuyerBuysStar = await web3.eth.getBalance(buyer);
    let value = Number(balanceOfbuyerBeforeTransaction) - Number(balanceAfterbuyerBuysStar);
    assert.equal(value, starPrice);
}).timeout(20000);

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let starId = 6;
    await instance.createStar('new star 6', starId, {from: accounts[0]});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name.call(), "StarNotaryToken");
    assert.equal(await instance.symbol.call(), "SNT");
}).timeout(20000);

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    // 1. create 2 Stars with different tokenId
    let owner1 = accounts[0];
    let starId1 = 7;
    let owner2 = accounts[1];
    let starId2 = 8;
    await instance.createStar('new star 7', starId1, {from: owner1});
    await instance.createStar('new star 8', starId2, {from: owner2});
    await instance.approveRecipient(starId1, owner2, {from: owner1});
    await instance.approveRecipient(starId2, owner1, {from: owner2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2);
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(starId1), owner2);
    assert.equal(await instance.ownerOf.call(starId2), owner1);
}).timeout(20000);

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let owner1 = accounts[0];
    let starId1 = 9;
    let owner2 = accounts[1];
    await instance.createStar('new star 9', starId1, {from: owner1});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.approveRecipient(starId1, owner2, {from: owner1});
    await instance.transferStar(owner2, starId1);
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starId1), owner2);
}).timeout(20000);

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let owner1 = accounts[0];
    let starId1 = 10;
    await instance.createStar('new star 10', starId1, {from: owner1});

    // 2. Call your method lookUptokenIdToStarInfo
    let star = await instance.lookUptokenIdToStarInfo.call(starId1);
    //console.log("name=" + star);
    // 3. Verify if you Star name is the same
    assert.equal(star, 'new star 10');
}).timeout(20000);