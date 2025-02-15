import numpy as np

def initialise(a, b):
    epsilon = 0.15
    #randomly initialises values of thetas between [-epsilon, +epsilon]
    c = np.random.rand(a, b + 1) * (2 * epsilon) - epsilon  
    return c