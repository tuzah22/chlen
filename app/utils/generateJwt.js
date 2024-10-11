const jwt = require('jsonwebtoken');
const tokenModel = require('../models/tokenModel');
const ApiError = require('../exceptions/apiErrors');


    const generateTokens = (userId) => {
        const accessToken = jwt.sign({userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'});
        const refreshToken = jwt.sign({userId}, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
        return {
            accessToken,
            refreshToken
        }
    }

    const saveTokens = async (userId, refreshToken) => {
        try {
            const tokenData = await tokenModel.findOne({ userId });
            if (tokenData) {
                tokenData.refreshToken = refreshToken;
                await tokenData.save();
                console.log('Token updated successfully');
                return tokenData;
            }
    
            const token = await tokenModel.create({
                userId: userId,
                refreshToken
            });
            await token.save();
            console.log('New token saved successfully:', token);
            return token;
        } catch (error) {
            console.error('Error saving token:', error);
            throw new Error('Token saving failed');
        }
    };

    const validateAccessToken = async (accessToken) => {
        try {
            const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    const validateRefreshToken = async (refreshToken) => {
        try {
            const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return res.json('Error!');
        }
    }

    const removeToken = async (refreshToken) => {
        const tokenData = await tokenModel.deleteOne({refreshToken});
        return tokenData;
    }

 
module.exports = {
    generateTokens,
    saveTokens,
    validateAccessToken,
    validateRefreshToken,
    removeToken
}