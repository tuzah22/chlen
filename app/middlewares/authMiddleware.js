const ApiError = require('../exceptions/apiErrors');
const jwt = require('../utils/generateJwt');

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authHeader.split(' ')[1];
        
        if (!accessToken) {
            return next(ApiError.UnauthorizedError());
        }
        console.log(accessToken);

        const userData = jwt.validateAccessToken(accessToken);
        
        if (!userData) {
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData;
        next();

    } catch (e) {
        console.error('Error in authMiddleware:', e);
        return next(ApiError.UnauthorizedError());
    }
};
