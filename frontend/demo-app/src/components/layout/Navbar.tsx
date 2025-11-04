import {
  AppShell,
  Group,
  Title,
  Box
} from '@mantine/core';
import {
  IconTruck
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();

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
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <IconTruck size={24} color="white" />
          </Box>
          
          <div>
            <Title 
              order={4} 
              style={{ 
                lineHeight: 1.2,
                marginBottom: 2,
                color: 'var(--mantine-color-text)',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              FastAPI Demo
            </Title>
          </div>
        </Group>



        {/* Right Side Navigation - removed theme toggle */}
        <Group gap="sm">
          {/* Additional navigation items can be added here */}
        </Group>
      </Group>
    </AppShell.Header>
  );
}; 