#!/usr/bin/env python3

import sys
import random

def fuzz(values, percentage): # vary a value by a certain random percentage (used to get "similar" things)
    fuzzed = []
    percentage = float(percentage)
    for i in range(0, len(values)):
        v = float(values[i])
        fuzzed.append(v + (v * random.uniform(-percentage, percentage)/100))
    return fuzzed

if __name__ == "__main__":
    print(fuzz(sys.argv[2:], sys.argv[1]))

