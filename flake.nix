{
  description = "Catalog of automated-browser detection methods with a Playwright test harness";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      forAllSystems = f: nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ] (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_22
            pkgs.playwright-driver.browsers
          ];
          env = {
            # Use the Nix-patched browser bundle instead of the binaries
            # `npx playwright install` downloads (which don't run on NixOS).
            # Keep @playwright/test in package.json pinned to the same version
            # as pkgs.playwright-driver so the browser revisions line up.
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
          };
          shellHook = ''
            echo "playwright-driver ${pkgs.playwright-driver.version} (pin @playwright/test to this)"
          '';
        };
      });
    };
}
