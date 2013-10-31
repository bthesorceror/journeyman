Feature: Server works correctly

  @with_middleware
  Scenario: renders correct page
    When I visit the root path
    Then I receive a success status code
    Then I see the text "WHERE AM I??" on the page

  @without_middleware
  Scenario: renders a 404
    When I visit the missing page
    Then I receive a not found status code

  @with_error_middleware
  Scenario: renders a 500
    When I visit the missing page
    Then I receive a error status code
    Then I see the correct error message
