import { AppShell, Group, Title, Button, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon, IconBell } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const navItems = [
    { label: 'Orders', path: '/' },
  ];

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Title order={3} c="blue">
            FastAPI Demo V2
          </Title>
          
          <Group gap="xs" ml="xl">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'filled' : 'subtle'}
                color="blue"
                size="sm"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </Group>
        </Group>

        <Group gap="sm">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => console.log('Notifications clicked')}
            title="Notifications"
          >
            <IconBell size={18} />
          </ActionIcon>
          
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={toggleColorScheme}
            title="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </Group>
    </AppShell.Header>
  );
};
