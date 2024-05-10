function tfcHeader(token: string) {
    return {
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${token}`
    }
}


export { tfcHeader };
