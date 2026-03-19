const COINS = 'bitcoin,ethereum,solana,binancecoin,cardano,polkadot,chainlink,polygon';

async function fetchCryptoPrices() {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS}&order=market_cap_desc&sparkline=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch prices");
    return res.json();
}

function formatPrice(price) {
    if (price >= 1000) return '$' + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (price >= 1) return "$" + price.toFixed(2);
    return "$" + price.toFixed(4);
}

function formatMarketCap(cap) {
    if (cap >= 1e12) return '$' + (cap / 1e12).toFixed(2) + "T";
    if (cap >= 1e9) return "$" + (cap / 1e9).toFixed(2) + "B";
    return "$" + (cap / 1e6).toFixed(0) + "M";
}

function renderData(coins) {

    const stats = coins.reduce((acc, coin) => {
        acc.totalMarketCap += coin.market_cap;
        acc.gainers += coin.price_change_percentage_24h > 0 ? 1 : 0;
        acc.losers += coin.price_change_percentage_24h < 0 ? 1 : 0;
        return acc;
    }, { totalMarketCap: 0, gainers: 0, losers: 0 });

    document.querySelector('#summary').innerHTML = `
        <div class='summary-card'>
          <div class='summary-val'>${formatMarketCap(stats.totalMarketCap)}</div>
          <div class='summary-lbl'>Total Market Cap</div>
        </div>
        <div class='summary-card'>
          <div class='summary-val up'>${stats.gainers} ↑</div>
          <div class='summary-lbl'>Gainers (24h)</div>
        </div>
        <div class='summary-card'>
          <div class='summary-val down'>${stats.losers} ↓</div>
          <div class='summary-lbl'>Losers (24h)</div>
        </div>`;

    document.querySelector('#cryptoTable').innerHTML = coins.map(coin => {
        const change = coin.price_change_percentage_24h;
        const changeClass = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
        const changeStr = (change > 0 ? '+' : '') + change.toFixed(2) + '%';

        return `<tr>
          <td class='rank'>${coin.market_cap_rank}</td>
          <td>
            <div class='coin-name'>${coin.name}</div>
            <div class='coin-symbol'>${coin.symbol.toUpperCase()}</div>
          </td>
          <td class='price'>${formatPrice(coin.current_price)}</td>
          <td class='${changeClass}'>${changeStr}</td>
          <td>${formatMarketCap(coin.market_cap)}</td>
        </tr>`;
    }).join('');

    document.querySelector('#lastUpdate').textContent =
        `Last updated: ${new Date().toLocaleTimeString()}`;
}

async function refresh() {
    try {
        const coins = await fetchCryptoPrices();
        renderData(coins);
    } catch (error) {
        document.querySelector("#lastUpdate").textContent = `Error: ${error.message}`;
    }
}

refresh();
setInterval(refresh, 30000);