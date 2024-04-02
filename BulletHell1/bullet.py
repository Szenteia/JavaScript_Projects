import pygame
from config import BULLET_SIZE, BULLET_COLOR, SCREEN_WIDTH, SCREEN_HEIGHT

class Bullet:
    def __init__(self, x, y):
        # Initialize bullet position
        self.x = x
        self.y = y
        self.speed = 5

    def update(self):
        # Update bullet position
        self.y -= self.speed

    def draw(self, screen):
        # Draw bullet on the screen
        pygame.draw.rect(screen, BULLET_COLOR, (self.x, self.y, BULLET_SIZE, BULLET_SIZE))

    def collide_with_enemy(self, enemy):
        # Check collision with enemy
        if (self.x < enemy.x + enemy.size and
            self.x + BULLET_SIZE > enemy.x and
            self.y < enemy.y + enemy.size and
            self.y + BULLET_SIZE > enemy.y):
            return True
        return False

    def collide_with_player(self, player):
        # Check collision with player
        if (self.x < player.x + player.size and
            self.x + BULLET_SIZE > player.x and
            self.y < player.y + player.size and
            self.y + BULLET_SIZE > player.y):
            return True
        return False
