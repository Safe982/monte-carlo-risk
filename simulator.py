"""Reference Python Monte Carlo model. Standard library only; illustrative inputs.
Run: python3 simulator.py --paths 10000 --seed 42
Uses the same portfolio model as the browser, but Python's random generator,
so individual paths differ. Compare distribution statistics, not exact paths.
"""
import argparse
import csv
import math
import random

CORRELATION = [[1, .75, -.1, .05], [.75, 1, -.05, .1], [-.1, -.05, 1, .1], [.05, .1, .1, 1]]

def simulate(weights=(.45, .15, .30, .10), mu=(.08, .07, .035, .045), vol=(.18, .20, .06, .15), balance=10000, years=1, paths=10000, confidence=.95, seed=42, threshold=.1):
    if not (len(weights) == len(mu) == len(vol) == 4):
        raise ValueError('Supply four assets')
    values = [*weights, *mu, *vol, balance, years, confidence, threshold]
    if not all(math.isfinite(x) for x in values):
        raise ValueError('All inputs must be finite')
    if any(w < 0 for w in weights) or not math.isclose(sum(weights), 1):
        raise ValueError('Nonnegative weights must sum to one')
    if balance <= 0 or years <= 0 or not isinstance(paths, int) or paths < 100 or not 0 < confidence < 1 or not 0 <= threshold <= 1 or any(v < 0 for v in vol):
        raise ValueError('Invalid simulation settings')
    drift = sum(w*m for w, m in zip(weights, mu))
    variance = sum(weights[i]*weights[j]*vol[i]*vol[j]*CORRELATION[i][j] for i in range(4) for j in range(4))
    rng = random.Random(seed)
    dt = years/120
    ends = []
    for _ in range(paths):
        value = balance
        for _ in range(120):
            value *= math.exp((drift-variance/2)*dt + math.sqrt(max(variance, 0)*dt)*rng.gauss(0, 1))
        ends.append(value)
    ordered = sorted(ends)
    def quantile(p):
        x = (paths-1)*p
        i = int(x)
        return ordered[i]+(ordered[min(i+1, paths-1)]-ordered[i])*(x-i)
    tail_n = max(1, math.ceil((1-confidence)*paths-1e-8))
    return dict(median=quantile(.5), var=balance-quantile(1-confidence), expected_shortfall=balance-sum(ordered[:tail_n])/tail_n, loss_probability=sum(v < balance*(1-threshold) for v in ends)/paths, ending_values=ends)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--paths', type=int, default=10000)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--output', default='simulation.csv')
    args = parser.parse_args()
    result = simulate(paths=args.paths, seed=args.seed)
    for key, value in result.items():
        if key != 'ending_values':
            print(f'{key}: {value:.4f}')
    with open(args.output, 'w', newline='') as output:
        writer = csv.writer(output)
        writer.writerow(['simulation', 'ending_value', 'return'])
        writer.writerows((i+1, value, value/10000-1) for i, value in enumerate(result['ending_values']))
