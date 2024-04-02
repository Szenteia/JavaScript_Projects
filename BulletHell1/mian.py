# main.py

import pygame
import sys
from player import Player
from enemy import Enemy
from config import SCREEN_WIDTH, SCREEN_HEIGHT

# Initialize Pygame
pygame.init()

# Set up the screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Bullet Hell Game")

# Create player
player = Player()

# Game loop
running = True
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # Update
    player.update()

    # Draw
    screen.fill((0, 0, 0))
    player.draw(screen)
    pygame.display.flip()

# Quit Pygame
pygame.quit()
sys.exit()
