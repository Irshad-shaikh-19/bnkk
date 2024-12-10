function determineDevice(userAgent) {
    if (userAgent.includes('Chrome')) {
        return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
        return 'Firefox';
    } else if (userAgent.includes('Safari')) {
        return 'Safari';
    } else if (userAgent.includes('Edge')) {
        return 'Edge';
    } else if (userAgent.includes('Opera')) {
        return 'Opera';
    } else {
        return 'Unknown';
    }
}

function getIpAddress(req) {
    let ipAddress = req;
    if (ipAddress.startsWith('::1')) {
        ipAddress = '127.0.0.1';
    }
    return ipAddress;
}

const getDeviceInfo = (ip, device) => {
    return {
        ip_address: getIpAddress(ip),
        device: determineDevice(device),
    };
};

module.exports = {
    determineDevice,
    getIpAddress,
    getDeviceInfo,
};
