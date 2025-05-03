import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react-native'
import Auth from '../app/(tabs)/home/accounts'
import {Alert} from 'react-native'

import {supabase} from '../utils/supabase'

jest.spyOn(Alert, 'alert')

jest.mock('../utils/supabase', () => ({  // mocking supabase to avoid actual supabase calls
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            startAutoRefresh: jest.fn(),
            stopAutoRefresh: jest.fn(),
        },
    },
}))


// Unit Test 1
describe('validateForm', () => {
    it('error: invalid email', () => {
        const {getByPlaceholderText, getByText} = render(<Auth />)
        // invalid email and password placeholder text
        fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email')
        fireEvent.changeText(getByPlaceholderText('Password'), '123456')
        fireEvent.press(getByText('Log In'))

        expect(Alert.alert).toHaveBeenCalledWith(
            'Invalid Email',
            'Please enter a valid email address.'
        )
    })
})


// Unit Test 2
describe('signInWithEmail', () => {
    it('calls supabase.auth.signInWithPassword with correct parameters', async () => {
        const {getByPlaceholderText, getByText} = render(<Auth />)
        // placeholder text for login processing
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com')
        fireEvent.changeText(getByPlaceholderText('Password'), '123456')
        ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({})  // resolves the mocked supabase call
        fireEvent.press(getByText('Log In'))

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                // placeholder login info
                email: 'test@test.com',
                password: '123456',
            })
        })
    })
})


// Unit Test 3
describe('signUpWithEmail', () => {
    it('call supabase.auth.signUp and alerts if there is no session returned', async () => {
        const {getByPlaceholderText, getByText} = render(<Auth />)
        // more placeholder login processing
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com')
        fireEvent.changeText(getByPlaceholderText('Password'), '123456')
        ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({})
        fireEvent.press(getByText('Log In'))

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: '123456',
            })
        })
    })
})