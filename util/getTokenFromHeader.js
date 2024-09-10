const getTokenFromHeader = (req) => {
    // get token from headers 
    // console.log(req);
    
    // console.log(req.headers.authorization.split(" ")[1]);
    
    // const token = req?.headers?.authorization?.split(" ")[1];
    // console.log(token);
    
    // if(token===undefined){
    //     throw new Error("No token found in the header");
    // }
    // return token;

    const authHeader = req.headers['authorization']; // or req.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]; // Extracts the token after 'Bearer'
    }
}

module.exports = getTokenFromHeader;