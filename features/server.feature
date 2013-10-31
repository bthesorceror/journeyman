Feature: Server

  Scenario: renders correct page
    When I visit the root path
    Then I receive a success status code
    Then I see the text "WHERE AM I??" on the page
