package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"runtime"
	"strconv"

	"github.com/zanellm/zanellm/internal/apierror"
	"github.com/zanellm/zanellm/internal/app"
	"github.com/zanellm/zanellm/internal/config"
	"github.com/zanellm/zanellm/internal/logger"
)

func exitWithPause(code int) {
	if code != 0 && runtime.GOOS == "windows" {
		fmt.Fprintln(os.Stderr, "\nPress Enter to exit...")
		bufio.NewReader(os.Stdin).ReadBytes('\n')
	}
	os.Exit(code)
}

func main() {
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "migrate":
			runMigrate(os.Args[2:])
			return
		case "migrate-schema":
			runMigrateSchema(os.Args[2:])
			return
		case "license":
			runLicense(os.Args[2:])
			return
		}
	}

	configPath := flag.String("config", "", "path to zanellm.yaml config file")
	devMode := flag.Bool("dev", false, "enable development mode (pprof, debug logging, CORS *)")
	flag.Parse()

	if ok, _ := strconv.ParseBool(os.Getenv("ZANELLM_DEV")); ok {
		*devMode = true
	}

	cfg, fromDefaults, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "zanellm: failed to load config: %v\n", err)
		exitWithPause(1)
	}

	if *devMode {
		cfg.Logging.Level = "debug"
	}

	log := slog.New(logger.NewRequestIDHandler(logger.New(cfg.Logging, os.Stdout).Handler(), apierror.RequestIDFromGoCtx))
	slog.SetDefault(log)

	if fromDefaults {
		log.Info("no config file found, using environment variables and built-in defaults")
	}

	if *devMode {
		log.Warn("========================================")
		log.Warn("DEVELOPMENT MODE ENABLED")
		log.Warn("CORS *, pprof :6060, debug logging active")
		log.Warn("Do NOT use in production")
		log.Warn("========================================")
	}

	application, err := app.New(cfg, log, *devMode)
	if err != nil {
		log.Error("startup failed", slog.String("error", err.Error()))
		exitWithPause(1)
	}

	if err := application.Start(); err != nil {
		log.Error("server start failed", slog.String("error", err.Error()))
		exitWithPause(1)
	}

	application.PrintBootstrapCredentials()
	application.WaitForShutdown(context.Background())
}
