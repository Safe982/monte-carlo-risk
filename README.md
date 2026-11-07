# Range — Monte Carlo Portfolio Risk Lab

An interactive portfolio risk simulator by Ayan Safe. Built with HTML, CSS, vanilla JavaScript, and a standard-library Python research implementation.

## Features
- Editable allocation across four asset classes, three presets, and allocation normalization.
- 2,000–25,000 seeded simulations, 3-month through 5-year horizons.
- 95% / 99% Value at Risk, expected shortfall, and probability of a chosen loss.
- Percentile bands, sample trajectories, ending-return histogram, comparison snapshot, CSV export.
- Responsive layout, keyboard controls, and explicitly documented assumptions.

## Run
Open `index.html` in a browser. No build or backend is required. The browser computes all results locally. JavaScript (not Java) powers the website; Python is an independent reference model, not a server.

Python: `python3 simulator.py --paths 10000 --seed 42`

Tests: `node test-engine.js`

## Method
Assume continuous rebalancing and geometric Brownian motion. Portfolio drift is `wᵀμ`; annual variance is `wᵀΣw`. We simulate `V(t+dt)=V(t) exp((μp−σp²/2)dt+σp sqrt(dt) Z)` for 120 steps using independent standard Gaussian shocks. Aggregation is equivalent to correlated asset Brownian shocks for a continuously rebalanced portfolio. It is not a buy-and-hold simulation.

VaR is initial capital minus the empirical lower-tail quantile (linear interpolation). Expected shortfall uses the worst `ceil((1-confidence)*N)` endings. Both can be negative when even the worst tail produces gains. The loss probability is the fraction of final values strictly below the selected threshold. The chart band is pointwise 5th–95th percentiles, independent of VaR confidence. Histogram bins cover the full realized range. The Python model uses a different PRNG; individual paths will differ.

Default annual drift / volatility assumptions: US equities 8% / 18%, international equities 7% / 20%, bonds 3.5% / 6%, gold 4.5% / 15%. Correlations are in `engine.js` and `simulator.py`. These are hypothetical teaching inputs, not live or historical estimates. No API keys, user tracking, or financial account access. Google Fonts is optional and falls back to system fonts.

## Limitations
Constant parameters, normal shocks, continuous rebalancing, no fees/taxes/cash flows. This may understate tail risk, volatility clustering, and correlation breakdowns. VaR is not maximum loss; horizon losses are not maximum drawdown. Educational research, not investment advice.

## Publish
GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
