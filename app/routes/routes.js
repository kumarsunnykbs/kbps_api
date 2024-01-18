const express = require('express');
const Router = express.Router();

const userControllers = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const cronController = require('../controllers/cronController');
const supportticketcon = require('../controllers/supportTicketController');


Router.get('/', function (req, res, next) {
    res.send('hello Kuber')
})

//user routes///
Router.post('/loginRegister', userControllers.register);
Router.post('/editUser', userControllers.editUser);
Router.get('/getUser', userControllers.getUser)
Router.post('/deposit', userControllers.deposit);
Router.post('/checkPaymentStatus', userControllers.checkPaymentStatus);
Router.post('/unlockReferral', userControllers.unlockReferral);
Router.get('/unilevelData', userControllers.unilevelData)
Router.post('/investment_pool', userControllers.investment_pool)
Router.get('/getUserPools', userControllers.getUserPools)
Router.get('/getKBRBalance', userControllers.getKBRBalance)
Router.get('/getBusdBalance', userControllers.getBusdBalance)
Router.post('/sendKBR', userControllers.sendKBR)
Router.get('/userTransaction', userControllers.userTransaction);
Router.get('/getUserStats', userControllers.getUserStats);
Router.get('/getPoolData', userControllers.getPoolData);
Router.get('/referralData', userControllers.referralData);
Router.post('/withdraw', userControllers.withdraw);
Router.get('/emailconfirmation/:activation_code', userControllers.confirmation);
Router.get('/verifyToken', userControllers.verifyToken);
Router.get('/userBonusGraph', userControllers.userBonusGraph);
Router.get('/userReferralBonusDetails', userControllers.userReferralBonusDetails);

//Admin routes //
Router.post('/admLogin', adminController.admLogin);
Router.post('/addProfitPools', adminController.addProfitPools);
Router.put('/editProfitPools', adminController.editProfitPools);
Router.delete('/delProfitPools/:id', adminController.delProfitPools)
Router.get('/getProfitPools', adminController.getProfitPools)
Router.post('/addRank', adminController.addRank);
Router.put('/editRank', adminController.editRank);
Router.delete('/delRank/:id', adminController.delRank);
Router.get('/getRank', adminController.getRank)
Router.post('/addPercentage', adminController.addPercentage);
Router.put('/editPercentage', adminController.editPercentage);
Router.delete('/delPercentage/:id', adminController.delPercentage);
Router.get('/getPercentage', adminController.getPercentage)
Router.get('/getAllUser', adminController.getAllUser);
Router.get('/getAllCountry', adminController.getAllCountry);
Router.get('/getAllPools', adminController.getAllPools);
Router.post('/addKbrToken', adminController.addKbrToken);
Router.get('/getKbrToken', adminController.getKbrToken);
Router.get('/dashboard', adminController.dashboard);
Router.get('/allTransactions', adminController.allTransactions);
Router.post('/withdrawal', adminController.withdrawal);
Router.post('/approval', adminController.approval);
Router.get('/getWithdrawalData', adminController.getWithdrawalData);
Router.get('/allWithdrawalData', adminController.allWithdrawalData);
Router.get('/lastWithdrawal/:year', adminController.lastWithdrawal);
Router.get('/bonusHistory', adminController.bonusHistory);
Router.post('/addMarketTools', adminController.addMarketTools);
Router.get('/getMarketTools', adminController.getMarketTools);
Router.delete('/delMarketTools/:id', adminController.delMarketTools);
//cron
Router.get('/giveDailyBonus', cronController.giveDailyBonus);
//Router.get('/giveDailyIndirectBonus', cronController.giveDailyIndirectBonus);
// Router.get('/earningGraph/:id/:year', cronController.earningGraph);
Router.get('/earningGraph/:year', cronController.earningGraph)

//Support Ticket
Router.post('/submittickets', supportticketcon.submittickets);
Router.get('/getTickets', supportticketcon.getTickets);
Router.post('/addTicketComment', supportticketcon.addTicketComment);
Router.get('/getTicketById', supportticketcon.getTicketById);
Router.post('/updateTicketStatus', supportticketcon.updateTicketStatus);
Router.get('/getCommentData/:ticket_id', supportticketcon.getCommentData);

module.exports = Router;