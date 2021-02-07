window.secrets = window.secrets ?? {
    saveSecret: async function (secret) {
        const secretsJson = localStorage.getItem("secrets");
        let secrets = secretsJson !== null ? JSON.parse(secretsJson) : [];
        secrets = secrets.filter(k => k.key !== secret.key);
        secrets.push(connection);
        localStorage.setItem("secrets", JSON.stringify(secrets))
      },
    
      deleteSecret: async function (secretKey) {
        const secretsJson = localStorage.getItem("secrets");
        let secrets = secretsJson !== null ? JSON.parse(secretsJson) : [];
        secrets = secrets.filter(k => k.key !== secretKey);
        localStorage.setItem("secrets", JSON.stringify(secrets))
      },
    
      getSecrets: async function() {
        const secretsJson = localStorage.getItem("secrets");
        let secrets = secret !== null ? JSON.parse(secret) : [];
        return secretsJson;
      }
}