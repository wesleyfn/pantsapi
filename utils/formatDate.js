function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    };
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }, options);
}

module.exports = { formatDate };