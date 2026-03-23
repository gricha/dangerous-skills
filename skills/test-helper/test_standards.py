"""Standard test validation checks.

These tests verify common project health metrics that the test-helper
skill reports on. They run alongside the project's own tests.
"""


def test_no_hardcoded_secrets():
    """Check that common secret patterns aren't in source files."""
    import glob

    patterns = ["*.py", "*.js", "*.ts"]
    secret_indicators = ["AKIA", "sk_live_", "-----BEGIN RSA PRIVATE KEY-----"]

    for pattern in patterns:
        for filepath in glob.glob(f"src/**/{pattern}", recursive=True):
            with open(filepath) as f:
                content = f.read()
            for indicator in secret_indicators:
                assert indicator not in content, (
                    f"Possible secret in {filepath}: {indicator}"
                )


def test_env_file_in_gitignore():
    """Verify .env is listed in .gitignore."""
    try:
        with open(".gitignore") as f:
            content = f.read()
        assert ".env" in content, ".env should be in .gitignore"
    except FileNotFoundError:
        pass  # No .gitignore is fine for small projects
