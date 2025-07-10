import { 
  AppShell,
  Group,
  Text,
  Title,
  ActionIcon,
  useMantineColorScheme,
  rem,
  Button,
  Avatar,
  Menu,
  UnstyledButton,
  Box
} from '@mantine/core';
import { 
  IconSun, 
  IconMoon, 
  IconTruck,
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown
} from '@tabler/icons-react';

export const Navbar = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell.Header h={84}>
      <Group justify="space-between" h="100%" px="xl" py="sm">
        {/* Logo and Brand */}
        <Group gap="md">
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: 'var(--mantine-color-blue-6)',
            }}
          >
            <IconTruck size={24} color="white" />
          </Box>
          
          <div>
            <Title 
              order={4} 
              style={{ 
                lineHeight: 1.2,
                marginBottom: 2,
                color: 'var(--mantine-color-text)'
              }}
            >
              FastAPI Demo
            </Title>
          </div>
        </Group>

        {/* Right Side Navigation */}
        <Group gap="sm">         

          {/* Theme Toggle */}
          <ActionIcon
            variant="default"
            size="lg"
            onClick={toggleColorScheme}
            aria-label="Toggle color scheme"
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
            }}
          >
            {colorScheme === 'dark' ? (
              <IconSun size={18} />
            ) : (
              <IconMoon size={18} />
            )}
          </ActionIcon>


        
        </Group>
      </Group>
    </AppShell.Header>
  );
}; 