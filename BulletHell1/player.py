import pygame
from config import PLAYER_SIZE, PLAYER_COLOR, SCREEN_WIDTH, SCREEN_HEIGHT

class Player:
    def __init__(self):
        # Initialize player position
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT - PLAYER_SIZE
        self.speed = 5

    def update(self):
        # Update player position based on input
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.x -= self.speed
        if keys[pygame.K_RIGHT]:
            self.x += self.speed

        # Ensure player stays within the screen bounds
        self.x = max(0, min(self.x, SCREEN_WIDTH - PLAYER_SIZE))
        self.y = max(0, min(self.y, SCREEN_HEIGHT - PLAYER_SIZE))

    def draw(self, screen):
        # Draw player on the screen
        pygame.draw.rect(screen, PLAYER_COLOR, (self.x, self.y, PLAYER_SIZE, PLAYER_SIZE))

    def shoot(self):
        # Placeholder for shooting functionality
        pass

    def collide_with_enemy(self, enemy):
        # Placeholder for collision detection with enemies
        pass
