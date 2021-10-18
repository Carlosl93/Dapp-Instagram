const { assert } = require("chai")
require('chai').use(require('chai-as-promised')).should()

const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })

    it('has a count', async () => {
      const count = await decentragram.imageLength()
      assert.equal(count, 0)
    })
  })

  describe('images', async () => {
    let result, imageCount
    const hash = 'abc123'
    const description = 'Image description'

    before(async () => {
      result = await decentragram.uploadImage(hash, description, { from: author })
      imageCount = await decentragram.imageLength()
    })

    it('creates image', async () => {
      assert.equal(imageCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'hash is correct')
      assert.equal(event.description, description, 'description is correct')
      assert.equal(event.tipAmount, 0, 'tip is correct')
      assert.equal(event.author, author, 'author is correct')

      // FAILURE
      // Hash empty
      await decentragram.uploadImage('', description, { from: author }).should.be.rejected
      // Description empty
      await decentragram.uploadImage(hash, '', { from: author }).should.be.rejected
      // Author empty
      await decentragram.uploadImage(hash, '', { from: 0x0 }).should.be.rejected
    })

    it('lists image', async () => {
      const image = await decentragram.images(imageCount)
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(image.hash, hash, 'hash is correct')
      assert.equal(image.description, description, 'description is correct')
      assert.equal(image.tipAmount, 0, 'tip is correct')
      assert.equal(image.author, author, 'author is correct')
    })

    it('tips image', async () => {
      const tipAmount = web3.utils.toWei('1', 'Ether')
      const tipBN = new web3.utils.BN(tipAmount)

      // Get balance before
      let oldOwnerBalance = await web3.eth.getBalance(author)
      oldOwnerBalance = new web3.utils.BN(oldOwnerBalance)

      // Trigger tip event
      result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: tipAmount })

      // Check if image and tip is ok
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hash, hash, 'hash is correct')
      assert.equal(event.description, description, 'description is correct')
      assert.equal(event.tipAmount, tipAmount, 'tip is correct')
      assert.equal(event.author, author, 'author is correct')

      // Get balance after
      let newOwnerBalance = await web3.eth.getBalance(author)
      newOwnerBalance = new web3.utils.BN(newOwnerBalance)

      const expectedBalance = oldOwnerBalance.add(tipBN)

      // Check is expected balance after tip
      assert.equal(newOwnerBalance.toString(), expectedBalance.toString(), 'balance is correct')

      // Check image id exists
      await decentragram.uploadImage(999999999, '', { from: tipper, value: tipAmount }).should.be.rejected

    })
  })
})